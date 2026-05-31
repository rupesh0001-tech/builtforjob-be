import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function deleteResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, message: 'Missing resume ID' });

    await prisma.resume.delete({
      where: { id, userId }
    });

    return res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
