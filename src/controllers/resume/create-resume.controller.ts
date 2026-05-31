import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function createResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, template, content, isDraft, isMagic } = req.body;

    let finalTitle = title;
    if (!finalTitle) {
      const count = await prisma.resume.count({
        where: { userId, title: { startsWith: 'Untitled-' } }
      });
      finalTitle = `Untitled-${count + 1}`;
    }

    const resume = await prisma.resume.create({
      data: {
        title: finalTitle,
        template: template || 'Modern',
        content: content || {},
        isDraft: isDraft !== undefined ? isDraft : false,
        isMagic: isMagic !== undefined ? isMagic : false,
        userId: userId,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
}
