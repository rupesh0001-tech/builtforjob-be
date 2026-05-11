import { Router } from 'express';
import { ResumeController } from '../../controllers/resume/resume.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

// All resume routes require authentication
router.use(authenticateJWT);

router.post('/', ResumeController.create as any);
router.get('/', ResumeController.getAll as any);
router.get('/:id', ResumeController.getById as any);
router.patch('/:id', ResumeController.update as any);
router.delete('/:id', ResumeController.delete as any);

// Versioning routes
router.post('/:id/versions', ResumeController.createVersion as any);
router.get('/:id/versions', ResumeController.getVersions as any);

export default router;
