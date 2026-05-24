import { Request, Response } from "express";
import { CoverLetterService } from "../../services/cover-letter/cover-letter.service";

const coverLetterService = new CoverLetterService();

export const handleCreateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const coverLetter = await coverLetterService.createCoverLetter(userId, req.body);
    res.status(201).json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetAllCoverLetters = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const coverLetters = await coverLetterService.getAllCoverLetters(userId);
    res.json(coverLetters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleGetCoverLetterById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const coverLetter = await coverLetterService.getCoverLetterById(userId, id);
    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }
    res.json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const coverLetter = await coverLetterService.updateCoverLetter(userId, id, req.body);
    res.json(coverLetter);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    await coverLetterService.deleteCoverLetter(userId, id);
    res.json({ message: "Cover letter deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
