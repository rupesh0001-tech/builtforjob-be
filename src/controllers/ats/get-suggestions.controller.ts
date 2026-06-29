import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { extractTextFromPDF, getImprovementSuggestions } from '../../services/ats/ats.service';
import prisma from '../../config/db.config';
import { deductTokens } from '../../utils/token.utils';

export async function getSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file!;
    const { jobDescription, reportId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Deduct 0.5 tokens for AI Suggestions generation (excluding main ATS check)
    try {
      await deductTokens(userId, 0.5);
    } catch (tokenErr: any) {
      return res.status(403).json({ 
        success: false, 
        errorType: 'INSUFFICIENT_TOKENS', 
        message: tokenErr.message 
      });
    }

    const resumeText = await extractTextFromPDF(file.buffer);
    const suggestions = await getImprovementSuggestions(resumeText, jobDescription.trim());

    if (reportId && userId) {
      await prisma.atsReport.updateMany({
        where: { id: reportId, userId },
        data: {
          suggestions: suggestions as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
}
