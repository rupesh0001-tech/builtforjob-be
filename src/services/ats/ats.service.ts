const { PDFParse } = require('pdf-parse');
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_TOKEN);

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

    let details = `The semantic similarity between your resume and the job description is ${score}%.`;
    
    if (score > 80) {
      details += " Excellent match! Your resume is highly relevant to this role.";
    } else if (score > 50) {
      details += " Good match. Consider adding more specific keywords from the job description to improve your score.";
    } else {
      details += " Low match. You may want to tailor your resume more closely to the requirements of this role.";
    }

    return {
      score,
      details
    };
  } catch (error: any) {
    console.error("Hugging Face Error:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};
