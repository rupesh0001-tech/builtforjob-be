import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getResumeById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, message: 'Missing resume ID' });

    const resume = await prisma.resume.findUnique({
      where: { id, userId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    return res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
}
