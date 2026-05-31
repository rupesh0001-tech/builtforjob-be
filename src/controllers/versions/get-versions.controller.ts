import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const versions = await prisma.applicationVersion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { resume: true },
    });

    return res.json(versions);
  } catch (error) {
    next(error);
  }
}
