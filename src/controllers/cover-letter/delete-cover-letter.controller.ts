import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function deleteCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing cover letter ID" });
    }

    await prisma.coverLetter.delete({
      where: { id, userId },
    });

    return res.json({ message: "Cover letter deleted successfully" });
  } catch (error) {
    next(error);
  }
}
