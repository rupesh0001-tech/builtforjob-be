import type { Request, Response, NextFunction } from 'express';
import { extractTextFromPDF, computeATSScore } from '../../services/ats/ats.service';
import { uploadToImageKit } from '../../services/imagekit/imagekit.service';
import prisma from '../../config/db.config';

export async function checkATS(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file!;
    const { jobDescription } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resumeText = await extractTextFromPDF(file.buffer);
    const { score, details } = await computeATSScore(resumeText, jobDescription.trim());

    let resumeUrl: string | null = null;
    try {
      const uploadResult = await uploadToImageKit(
        file.buffer,
        `ats_${Date.now()}_${file.originalname}`,
        "/ats_resumes"
      );
      resumeUrl = uploadResult.url;
    } catch (uploadErr: unknown) {
      const err = uploadErr as Error;
      console.error("Failed to upload resume to ImageKit:", err.message);
    }

    const report = await prisma.atsReport.create({
      data: {
        userId,
        resumeName: file.originalname,
        resumeUrl,
        resumeText,
        jobDescription: jobDescription.trim(),
        score,
        details,
        resumeWordCount: resumeText.split(/\s+/).filter(Boolean).length,
        jdWordCount: jobDescription.trim().split(/\s+/).filter(Boolean).length,
      },
    });

    return res.json({
      success: true,
      data: {
        id: report.id,
        score: report.score,
        details: report.details,
        resumeWordCount: report.resumeWordCount,
        jdWordCount: report.jdWordCount,
        resumeUrl: report.resumeUrl,
        resumeName: report.resumeName,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
