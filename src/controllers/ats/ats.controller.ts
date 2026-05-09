import type { Request, Response, NextFunction } from 'express';
import { extractTextFromPDF, computeATSScore, getImprovementSuggestions } from '../../services/ats/ats.service';

/**
 * POST /ats/check
 * Multipart form body:
 *   - resume: PDF file  (uploaded via multer)
 *   - jobDescription: string
 */
export const checkATS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file!; // Guaranteed by validateFile middleware
    const { jobDescription } = req.body;

    // --- Extract text from PDF ---
    const resumeText = await extractTextFromPDF(file.buffer);

    // --- Compute ATS score via HuggingFace ---
    const { score, details } = await computeATSScore(resumeText, jobDescription.trim());

    return res.json({
      success: true,
      data: {
        score,
        details,
        resumeWordCount: resumeText.split(/\s+/).filter(Boolean).length,
        jdWordCount: jobDescription.trim().split(/\s+/).filter(Boolean).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ats/suggestions
 * Multipart form body:
 *   - resume: PDF file
 *   - jobDescription: string
 */
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file!;
    const { jobDescription } = req.body;

    const resumeText = await extractTextFromPDF(file.buffer);
    const suggestions = await getImprovementSuggestions(resumeText, jobDescription.trim());

    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ats/extract
 * Multipart form body:
 *   - resume: PDF file
 * Returns the raw extracted text (useful for debugging / preview)
 */
export const extractResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file!;

    const text = await extractTextFromPDF(file.buffer);

    return res.json({
      success: true,
      data: {
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        charCount: text.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
