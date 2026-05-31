import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { extractTextFromPDF, getImprovementSuggestions } from '../../services/ats/ats.service';
import prisma from '../../config/db.config';

export async function getSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file!;
    const { jobDescription, reportId } = req.body;
    const userId = req.user?.userId;

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
