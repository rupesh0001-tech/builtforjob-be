import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function updateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }

    const coverLetter = await prisma.coverLetter.update({
      where: { id, userId },
      data: req.body,
    });

    return res.json(coverLetter);
  } catch (error) {
    next(error);
  }
}
