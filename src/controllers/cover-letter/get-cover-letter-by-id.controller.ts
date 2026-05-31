import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getCoverLetterById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      return res.status(404).json({ error: "Cover letter not found" });
    }

    return res.json(coverLetter);
  } catch (error) {
    next(error);
  }
}
