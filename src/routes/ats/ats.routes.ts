import { Router } from 'express';
import multer from 'multer';
import { checkATS } from '../../controllers/ats/check-ats.controller';
import { getSuggestions } from '../../controllers/ats/get-suggestions.controller';
import { extractResume } from '../../controllers/ats/extract-resume.controller';
import { getReports } from '../../controllers/ats/get-reports.controller';
import { getReportById } from '../../controllers/ats/get-report-by-id.controller';
import { unlockReportSuggestions } from '../../controllers/ats/unlock-report-suggestions.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { validate, validateFile } from '../../middlewares/validation/validator.middleware';
import { atsCheckSchema, atsFileSchema } from '../../validators/ats.validator';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.post(
  '/check',
  authenticateJWT,
  upload.single('resume'),
  validateFile(atsFileSchema),
  validate(atsCheckSchema),
  checkATS
);

router.post(
  '/suggestions',
  authenticateJWT,
  upload.single('resume'),
  validateFile(atsFileSchema),
  validate(atsCheckSchema),
  getSuggestions
);

router.post(
  '/extract',
  authenticateJWT,
  upload.single('resume'),
  validateFile(atsFileSchema),
  extractResume
);

router.get(
  '/reports',
  authenticateJWT,
  getReports
);

router.get(
  '/reports/:id',
  authenticateJWT,
  getReportById
);

router.post(
  '/reports/:id/unlock',
  authenticateJWT,
  unlockReportSuggestions
);

export { router as atsRouter };
