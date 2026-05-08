import { Request, Response } from "express";
import * as versionsService from "../../services/versions/versions.service";

export const handleCreateVersion = async (req: Request, res: Response) => {
  try {
    const { versionName, companyName } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const resumeFile = files["resume"]?.[0];
    const clFile = files["coverLetter"]?.[0];

    if (!resumeFile) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const version = await versionsService.createVersion({
      versionName,
      companyName,
      resumeBuffer: resumeFile.buffer,
      resumeName: resumeFile.originalname,
      coverLetterBuffer: clFile?.buffer,
      coverLetterName: clFile?.originalname,
      userId,
    });

    res.status(201).json(version);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetVersions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const versions = await versionsService.getAllVersions(userId);
    res.json(versions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleDeleteVersion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await versionsService.deleteVersion(id, userId);
    res.json({ message: "Version deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
