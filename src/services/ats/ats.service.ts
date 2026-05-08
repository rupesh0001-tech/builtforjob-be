const { PDFParse } = require('pdf-parse');
import { InferenceClient } from "@huggingface/inference";
import { GoogleGenAI } from "@google/genai";

const hf = new InferenceClient(process.env.HF_TOKEN);
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  apiVersion: "v1"
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
 * Gets improvement suggestions using Gemini (via new @google/genai SDK).
 */
export const getImprovementSuggestions = async (
  resumeText: string,
  jobDescription: string
): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  const prompt = `
    You are an expert Career Coach and ATS Optimizer. 
    Analyze the provided Resume and Job Description.
    
    Resume:
    ${resumeText.slice(0, 6000)}

    Job Description:
    ${jobDescription.slice(0, 4000)}

    Provide a concise analysis of what is missing or what could be improved in the resume to better match the job description.
    Focus on:
    1. Missing key skills/keywords.
    2. Experience alignment.
    3. Actionable tips to improve the ATS score.

    Format the response in clear bullet points. Keep it under 200 words.
  `;

  try {
    // List of models to try in order of preference
    const modelsToTry = [
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting suggestions with model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        
        if (response && response.text) {
          console.log(`Success with model: ${modelName}`);
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed: ${err.message}`);
        // Continue to next model
      }
    }

    // If we reach here, all models failed
    throw lastError || new Error("All Gemini models failed to generate content.");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`Failed to generate suggestions: ${error.message}`);
  }
};
