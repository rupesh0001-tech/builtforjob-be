import { ai, groq } from '../../config/ai.config';
import type { IATSSuggestionsResult, IATSScoreResult } from '../../interfaces/ats.interface';
const { PDFParse } = require('pdf-parse');

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
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to parse PDF: ${err.message}`);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy();
    }
  }
};

/**
 * Normalizes text for comparison.
 */
const normalizeText = (text: string): string => text.toLowerCase().replace(/[^\w\s]/g, '');

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
): Promise<IATSScoreResult> => {
  if (!resumeText || !jobDescription) {
    return { score: 0, details: "Missing resume or job description text." };
  }

  const cleanResume = normalizeText(resumeText);
  const cleanJD = normalizeText(jobDescription);

  if (cleanResume === cleanJD || cleanResume.includes(cleanJD) || cleanJD.includes(cleanResume)) {
    return { score: 100, details: "Perfect content match detected." };
  }

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
        const parsed = JSON.parse(text) as { score: number; justification?: string };
        if (typeof parsed.score === 'number') {
          return {
            score: parsed.score,
            details: parsed.justification || "ATS analysis complete."
          };
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.warn("Groq scoring failed, falling back to Gemini:", err.message);
    }
  }

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
          const parsed = JSON.parse(jsonMatch[0]) as { score: number; justification: string };
          if (typeof parsed.score === 'number') {
            return { score: parsed.score, details: parsed.justification };
          }
        }
      }
    } catch (err: any) {
      console.warn("Gemini scoring fallback failed:", err.message);
    }
  }

  const keywordScore = calculateKeywordScore(resumeText, jobDescription);
  return {
    score: keywordScore,
    details: "Calculated via local keyword overlap (AI fallback)."
  };
};

/**
 * Gets suggestions using Groq (Llama 3.3 70B) as a fallback.
 */
export const getGroqSuggestions = async (
  prompt: string
): Promise<IATSSuggestionsResult> => {
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
      return JSON.parse(text) as IATSSuggestionsResult;
    }
    throw new Error("Empty response from Groq.");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Groq Error:", err);
    throw new Error(`Groq fallback failed: ${err.message}`);
  }
};

/**
 * Gets structured improvement suggestions using Gemini (via new @google/genai SDK).
 */
export const getImprovementSuggestions = async (
  resumeText: string,
  jobDescription: string
): Promise<IATSSuggestionsResult> => {
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

  // Try Groq First
  if (process.env.GROQ_API_KEY) {
    try {
      return await getGroqSuggestions(prompt);
    } catch (groqErr: any) {
      console.warn("Groq suggestions failed, falling back to Gemini:", groqErr.message);
    }
  }

  // Fallback to Gemini
  if (process.env.GEMINI_API_KEY) {
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting fallback structured suggestions with model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        const text = response.text;
        
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleanJson = jsonMatch[0].trim();
            try {
              const parsed = JSON.parse(cleanJson) as IATSSuggestionsResult;
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
      } catch (err: unknown) {
        const errorObject = err as Error;
        lastError = errorObject;
        console.warn(`Model ${modelName} failed: ${errorObject.message}`);
      }
    }
    if (lastError) throw lastError;
  }

  throw new Error("Failed to generate suggestions using available models.");
};
