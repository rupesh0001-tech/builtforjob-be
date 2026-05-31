import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { uploadToImageKit } from '../../services/imagekit/imagekit.service';

export async function createVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const { versionName, companyName, resumeId, resumeUrl, coverLetterUrl } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const resumeFile = files?.["resume"]?.[0];
    const clFile = files?.["coverLetter"]?.[0];

    if (!resumeFile && !resumeId && !resumeUrl) {
      return res.status(400).json({ message: "Resume file, project, or existing URL is required" });
    }

    let finalResumeUrl = resumeUrl;
    if (resumeFile) {
      const resumeUpload = await uploadToImageKit(
        resumeFile.buffer,
        `resume_${Date.now()}_${resumeFile.originalname}`
      );
      finalResumeUrl = resumeUpload.url;
    }

    let finalCoverLetterUrl = coverLetterUrl;
    if (clFile) {
      const clUpload = await uploadToImageKit(
        clFile.buffer,
        `cl_${Date.now()}_${clFile.originalname}`
      );
      finalCoverLetterUrl = clUpload.url;
    }

    const version = await prisma.applicationVersion.create({
      data: {
        versionName,
        companyName,
        resumeUrl: finalResumeUrl,
        resumeId: resumeId || null,
        coverLetterUrl: finalCoverLetterUrl,
        userId,
      },
    });

    return res.status(201).json(version);
  } catch (error) {
    next(error);
  }
}
