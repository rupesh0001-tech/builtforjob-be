import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function createCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const coverLetter = await prisma.coverLetter.create({
      data: {
        ...req.body,
        userId,
      },
    });

    return res.status(201).json(coverLetter);
  } catch (error) {
    next(error);
  }
}
