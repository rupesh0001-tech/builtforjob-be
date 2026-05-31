import { Router } from 'express';
import { createResume } from '../../controllers/resume/create-resume.controller';
import { updateResume } from '../../controllers/resume/update-resume.controller';
import { createVersion } from '../../controllers/resume/create-version.controller';
import { getResumes } from '../../controllers/resume/get-resumes.controller';
import { getResumeById } from '../../controllers/resume/get-resume-by-id.controller';
import { deleteResume } from '../../controllers/resume/delete-resume.controller';
import { getResumeVersions } from '../../controllers/resume/get-resume-versions.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { validate } from '../../middlewares/validation/validator.middleware';
import { createResumeSchema, updateResumeSchema, createResumeVersionSchema } from '../../validators/resume.validator';

const router = Router();

router.use(authenticateJWT);

router.post('/', validate(createResumeSchema), createResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.patch('/:id', validate(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);

router.post('/:id/versions', validate(createResumeVersionSchema), createVersion);
router.get('/:id/versions', getResumeVersions);

export default router;
