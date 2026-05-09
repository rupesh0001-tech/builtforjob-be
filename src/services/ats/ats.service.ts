const { PDFParse } = require('pdf-parse');
import { InferenceClient } from "@huggingface/inference";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const hf = new InferenceClient(process.env.HF_TOKEN);
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ""
});

/**
 * Extracts plain text from a PDF buffer using pdf-parse
 */
export const extractTextFromPDF = async (pdfBuffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const data = await parser.getText();
    const text = data.text?.trim();
    if (!text) {
      throw new Error('Could not extract any text from the PDF. The file may be scanned or image-based.');
    }
    return text;
  } catch (error: any) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  } finally {
    // Always call destroy() to free memory as per documentation
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy();
    }
  }
};

/**
 * Computes ATS similarity score between resume text and job description using Hugging Face.
 */
export const computeATSScore = async (
  resumeText: string,
  jobDescription: string
): Promise<{ score: number; details: string }> => {
  if (!process.env.HF_TOKEN) {
    throw new Error('Hugging Face token (HF_TOKEN) is not configured on the server.');
  }

  try {
    const output = await hf.sentenceSimilarity({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: {
        source_sentence: jobDescription,
        sentences: [resumeText]
      },
      provider: "hf-inference",
    });

    // The output is an array of similarity scores for each sentence in 'sentences'
    // Since we only passed one 'resumeText', we take the first index.
    const similarityScore = Array.isArray(output) ? output[0] : (output as any);
    const score = Math.round(similarityScore * 100);

    return {
      score,
      details: "" // Suggestions moved to separate call
    };
  } catch (error: any) {
    console.error("Hugging Face Error:", error);
    throw new Error(`Similarity analysis failed: ${error.message}`);
  }
};

/**
 * Gets suggestions using Groq (Llama 3.3 70B) as a fallback.
 */
export const getGroqSuggestions = async (
  prompt: string
): Promise<any> => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key is not configured.');
  }

  try {
    console.log("Attempting fallback suggestions with Groq (Llama 3.3)...");
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Empty response from Groq.");
  } catch (error: any) {
    console.error("Groq Error:", error);
    throw new Error(`Groq fallback failed: ${error.message}`);
  }
};

/**
 * Gets structured improvement suggestions using Gemini (via new @google/genai SDK).
 */
export const getImprovementSuggestions = async (
  resumeText: string,
  jobDescription: string
): Promise<{
  improvements: Array<{ title: string; description: string; impact: number }>;
  missingKeywords: string[];
  missingSkills: string[];
}> => {
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    throw new Error('No AI API keys configured.');
  }

  const prompt = `
    You are an expert Career Coach and ATS Optimizer. 
    Analyze the provided Resume and Job Description.
    
    Resume:
    ${resumeText.slice(0, 6000)}

    Job Description:
    ${jobDescription.slice(0, 4000)}

    Provide a highly structured analysis of specific structural and content gaps. 
    Do NOT give generic career advice like "tailor your resume". 
    Instead, look for CONCRETE missing elements such as:
    - Missing GitHub or Portfolio links.
    - Missing Deployed/Live project URLs.
    - Missing Contact Information (LinkedIn, Phone, etc.).
    - Specific Technical Skills mentioned in the Job Description but absent from the Resume.
    - Experience gaps where specific tools/technologies required are not found.

    Return ONLY a JSON object with this exact structure:
    {
      "improvements": [
        { "title": "Missing Live Project Links", "description": "Add deployed URLs for your 'Project X' to prove technical competence.", "impact": 85 }
      ],
      "missingKeywords": ["keyword1", "keyword2"],
      "missingSkills": ["skill1", "skill2"]
    }

    Ensure:
    1. Exactly 3-4 concrete improvements with an "impact" percentage (0-100).
    2. A list of missing keywords for ATS optimization.
    3. A list of missing professional skills or experiences.
    
    Return ONLY the JSON. No preamble, no markdown code blocks.
  `;

  try {
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    let lastError = null;

    // 1. Try Gemini Models
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting structured suggestions with model: ${modelName}...`);
        const result = await ai.getGenerativeModel({ model: modelName }).generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text) {
          // Robust JSON extraction: find first '{' and last '}'
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleanJson = jsonMatch[0].trim();
            try {
              const parsed = JSON.parse(cleanJson);
              if (parsed.improvements && Array.isArray(parsed.improvements)) {
                console.log(`Successfully parsed suggestions from ${modelName}`);
                return parsed;
              }
            } catch (parseErr) {
              console.warn(`JSON parse failed for ${modelName}:`, parseErr);
            }
          } else {
            console.warn(`No JSON found in response from ${modelName}`);
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed: ${err.message}`);
      }
    }

    // 2. Fallback to Groq
    try {
      return await getGroqSuggestions(prompt);
    } catch (groqErr) {
      console.error("Groq fallback also failed.");
      throw lastError || groqErr;
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(`Failed to generate improvements: ${error.message}`);
  }
};
