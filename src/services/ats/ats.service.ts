const { PDFParse } = require('pdf-parse');
import { InferenceClient } from "@huggingface/inference";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const hf = new InferenceClient(process.env.HF_TOKEN);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
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
 * Normalizes text for comparison.
 */
const normalizeText = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '');

/**
 * Fallback keyword score calculation.
 */
const calculateKeywordScore = (resume: string, jd: string): number => {
  const jdKeywords = jd.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const uniqueKeywords = Array.from(new Set(jdKeywords));
  const foundCount = uniqueKeywords.filter(w => resume.toLowerCase().includes(w)).length;
  return Math.round((foundCount / Math.max(1, uniqueKeywords.length)) * 100);
};

/**
 * Computes ATS similarity score between resume text and job description.
 * Uses Gemini (AI) for professional-grade analysis, with keyword matching as a fallback.
 */
export const computeATSScore = async (
  resumeText: string,
  jobDescription: string
): Promise<{ score: number; details: string }> => {
  if (!resumeText || !jobDescription) {
    return { score: 0, details: "Missing resume or job description text." };
  }

  const cleanResume = normalizeText(resumeText);
  const cleanJD = normalizeText(jobDescription);

  // 1. Exact/Near-Exact Match Check (Fast path)
  if (cleanResume === cleanJD || cleanResume.includes(cleanJD) || cleanJD.includes(cleanResume)) {
    return { score: 100, details: "Perfect content match detected." };
  }

  // 2. AI-Powered Professional Scoring (Groq Primary)
  if (process.env.GROQ_API_KEY) {
    try {
      const prompt = `
        As a technical ATS (Applicant Tracking System), calculate the match score (0-100) for this resume against the JD.
        
        STRICT SCORING CRITERIA:
        - 95-100%: Perfect match of core tech stack, even if project names differ.
        - 90-95%: Strong match with synonymous technology (e.g., "MERN" matches a list of MongoDB, Express, React, Node).
        - 80-90%: Good match, missing only minor non-essential skills.
        - <70%: Significant gaps in core requirements.

        RESUME:
        ${resumeText}

        JOB DESCRIPTION:
        ${jobDescription}

        RETURN ONLY JSON:
        { "score": number, "justification": "Explain why in 1 sentence." }
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const text = completion.choices[0]?.message?.content;
      if (text) {
        const parsed = JSON.parse(text);
        if (typeof parsed.score === 'number') {
          return {
            score: parsed.score,
            details: parsed.justification || "ATS analysis complete."
          };
        }
      }
    } catch (error: any) {
      console.warn("Groq scoring failed, falling back to Gemini:", error.message);
    }
  }

  // 2b. Secondary AI Scoring (Gemini Fallback)
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Calculate ATS score (0-100) for this resume vs JD. Return JSON: { "score": number, "justification": "string" }. Resume: ${resumeText}. JD: ${jobDescription}`;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.score === 'number') {
            return { score: parsed.score, details: parsed.justification };
          }
        }
      }
    } catch (err) {}
  }

  // 3. Fallback: Hybrid Keyword & Semantic Logic (Existing)
  const keywordScore = calculateKeywordScore(resumeText, jobDescription);
  let semanticScore = keywordScore;

  if (process.env.HF_TOKEN) {
    try {
      const output = await hf.sentenceSimilarity({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: {
          source_sentence: jobDescription,
          sentences: [resumeText]
        },
        provider: "hf-inference",
      });
      const similarity = Array.isArray(output) ? output[0] : (output as any);
      semanticScore = Math.round(similarity * 100);
    } catch (err) {
      // ignore
    }
  }

  const finalScore = Math.min(100, Math.round((keywordScore * 0.7) + (semanticScore * 0.3)));
  
  return {
    score: finalScore,
    details: "Calculated via keyword and semantic overlap (AI fallback)."
  };
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
    ${resumeText}

    Job Description:
    ${jobDescription}

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
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        const text = response.text;
        
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
