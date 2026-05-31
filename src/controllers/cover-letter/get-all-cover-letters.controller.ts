import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getAllCoverLetters(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json(coverLetters);
  } catch (error) {
    next(error);
  }
}
