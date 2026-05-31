import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';

export async function createVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params; // resumeId
    const { company, role, content } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, message: 'Missing resume ID' });

    // First ensure the resume belongs to the user
    const resume = await prisma.resume.findUnique({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
    }

    const version = await prisma.resumeVersion.create({
      data: {
        resumeId: id,
        company: company || 'General',
        role: role || 'Snapshot',
        content: content,
        status: 'Active'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Resume version saved successfully',
      data: version
    });
  } catch (error) {
    next(error);
  }
}
