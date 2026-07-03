import type { Request, Response, NextFunction } from 'express';
import { uploadToImageKit } from '../../services/imagekit/imagekit.service';

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Determine target folder based on type
    const folder = file.mimetype.startsWith('image/') ? '/portfolio/images' : '/portfolio/resumes';
    const sanitizeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const result = await uploadToImageKit(
      file.buffer, 
      `file-${userId}-${Date.now()}-${sanitizeName}`, 
      folder
    );

    return res.json({
      success: true,
      message: 'File uploaded successfully',
      url: result.url
    });
  } catch (error) {
    next(error);
  }
}
