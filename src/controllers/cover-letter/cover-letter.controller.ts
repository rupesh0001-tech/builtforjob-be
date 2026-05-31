import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth/jwt.middleware";
import { CoverLetterService } from "../../services/cover-letter/cover-letter.service";

const coverLetterService = new CoverLetterService();

export const handleCreateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const coverLetter = await coverLetterService.createCoverLetter(userId, req.body);
    res.status(201).json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetAllCoverLetters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const coverLetters = await coverLetterService.getAllCoverLetters(userId);
    res.json(coverLetters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetCoverLetterById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }
    const coverLetter = await coverLetterService.getCoverLetterById(userId, id);
    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }
    res.json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }
    const coverLetter = await coverLetterService.updateCoverLetter(userId, id, req.body);
    res.json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }
    await coverLetterService.deleteCoverLetter(userId, id);
    res.json({ message: "Cover letter deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
