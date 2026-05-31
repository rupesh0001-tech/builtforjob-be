import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}
