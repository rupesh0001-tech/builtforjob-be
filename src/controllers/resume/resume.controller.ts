import { Response, NextFunction } from 'express';
import { ResumeService } from '../../services/resume/resume.service';
import { AuthRequest } from '../../middlewares/auth/jwt.middleware';

export class ResumeController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const resume = await ResumeService.createResume(userId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Resume created successfully',
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const resume = await ResumeService.updateResume(id, userId, req.body);

      return res.json({
        success: true,
        message: 'Resume updated successfully',
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  static async createVersion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params; // resumeId
      const { company, role, content } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const version = await ResumeService.createVersion(id, userId, { company, role, content });

      return res.status(201).json({
        success: true,
        message: 'Resume version saved successfully',
        data: version
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const resumes = await ResumeService.getResumes(userId);

      return res.json({
        success: true,
        data: resumes
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const resume = await ResumeService.getResumeById(id, userId);
      if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

      return res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await ResumeService.deleteResume(id, userId);

      return res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params; // resumeId
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const versions = await ResumeService.getVersions(id, userId);

      return res.json({
        success: true,
        data: versions
      });
    } catch (error) {
      next(error);
    }
  }
}
