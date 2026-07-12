import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { uploadToImageKit } from '../../services/imagekit/imagekit.service';

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToImageKit(file.buffer, `avatar-${userId}-${Date.now()}`, "/avatars");

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.url },
      include: {
        skills: true,
        experience: true,
        education: true,
        projects: true,
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}
