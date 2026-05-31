import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getResumes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { versions: true }
        }
      }
    });

    return res.json({
      success: true,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
}
