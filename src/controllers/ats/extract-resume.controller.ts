import type { Request, Response, NextFunction } from 'express';
import { extractTextFromPDF } from '../../services/ats/ats.service';

export async function extractResume(req: Request, res: Response, next: NextFunction) {
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
}
