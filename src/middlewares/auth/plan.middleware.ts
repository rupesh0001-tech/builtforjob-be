import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function requirePro(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.plan !== 'PRO') {
      return res.status(403).json({
        success: false,
        errorType: 'PLAN_GATED',
        message: 'This feature is only available on the PRO plan. Please upgrade your subscription to gain access.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
