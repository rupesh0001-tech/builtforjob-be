import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { getImprovementSuggestions } from '../../services/ats/ats.service';
import prisma from '../../config/db.config';

export async function unlockReportSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const report = await prisma.atsReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.suggestions) {
      return res.json({
        success: true,
        data: report.suggestions,
      });
    }

    const resumeText = report.resumeText || "";
    if (!resumeText) {
      return res.status(400).json({ message: "Cannot generate suggestions because resume text is missing." });
    }

    const suggestions = await getImprovementSuggestions(resumeText, report.jobDescription);

    await prisma.atsReport.update({
      where: { id },
      data: {
        suggestions: suggestions as unknown as Prisma.InputJsonValue,
      },
    });

    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
}
