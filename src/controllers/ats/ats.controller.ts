import type { Request, Response, NextFunction } from 'express';
import { extractTextFromPDF, computeATSScore, getImprovementSuggestions } from '../../services/ats/ats.service';
import { PrismaClient } from "@prisma/client";
import { uploadToImageKit } from "../../services/imagekit/imagekit.service";

const prisma = new PrismaClient();

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
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // --- Extract text from PDF ---
    const resumeText = await extractTextFromPDF(file.buffer);

    // --- Compute ATS score via HuggingFace ---
    const { score, details } = await computeATSScore(resumeText, jobDescription.trim());

    // --- Upload Resume PDF to ImageKit ---
    let resumeUrl: string | null = null;
    try {
      const uploadResult = await uploadToImageKit(
        file.buffer,
        `ats_${Date.now()}_${file.originalname}`,
        "/ats_resumes"
      );
      resumeUrl = uploadResult.url;
    } catch (uploadErr: any) {
      console.error("Failed to upload resume to ImageKit:", uploadErr.message);
    }

    // --- Save Report to Database ---
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
};

/**
 * POST /ats/suggestions
 * Multipart form body:
 *   - resume: PDF file
 *   - jobDescription: string
 *   - reportId?: string
 */
export const getSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file!;
    const { jobDescription, reportId } = req.body;
    const userId = (req as any).user?.userId;

    const resumeText = await extractTextFromPDF(file.buffer);
    const suggestions = await getImprovementSuggestions(resumeText, jobDescription.trim());

    // If reportId is passed and userId is valid, save suggestions in database
    if (reportId && userId) {
      await prisma.atsReport.updateMany({
        where: { id: reportId, userId },
        data: {
          suggestions: suggestions as any,
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

/**
 * GET /ats/reports
 * Lists all reports for the current user
 */
export const handleGetReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reports = await prisma.atsReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /ats/reports/:id
 * Gets a single report by ID
 */
export const handleGetReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const report = await prisma.atsReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ats/reports/:id/unlock
 * Generates AI suggestions for a previously saved report
 */
export const handleUnlockReportSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
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
        suggestions: suggestions as any,
      },
    });

    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

