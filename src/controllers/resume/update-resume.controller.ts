import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function updateResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, message: 'Missing resume ID' });

    const resume = await prisma.resume.update({
      where: { id, userId },
      data: {
        ...req.body,
        updatedAt: new Date(),
      }
    });

    return res.json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
}
