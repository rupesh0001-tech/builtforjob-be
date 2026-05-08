import { Router } from 'express';
import multer from 'multer';
import { checkATS, extractResume } from '../../controllers/ats/ats.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { validate, validateFile } from '../../middlewares/validation/validator.middleware';
import { atsCheckSchema, atsFileSchema } from '../../validators/ats.validator';

const router = Router();

// Store file in memory (buffer) – no disk I/O needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// POST /ats/check  – full ATS score (protected)
router.post(
  '/check',
  authenticateJWT,
  upload.single('resume'),
  validateFile(atsFileSchema),
  validate(atsCheckSchema),
  checkATS as any
);

// POST /ats/extract – extract text only (protected)
router.post(
  '/extract',
  authenticateJWT,
  upload.single('resume'),
  validateFile(atsFileSchema),
  extractResume as any
);

export { router as atsRouter };
