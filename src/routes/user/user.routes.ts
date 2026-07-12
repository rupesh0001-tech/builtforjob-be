import { Router } from 'express';
import multer from 'multer';
import { getProfile } from '../../controllers/user/get-profile.controller';
import { updateProfile } from '../../controllers/user/update-profile.controller';
import { uploadAvatar } from '../../controllers/user/upload-avatar.controller';
import { uploadFile } from '../../controllers/user/upload-file.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { validate } from '../../middlewares/validation/validator.middleware';
import { updateProfileSchema } from '../../validators/user.validator';

const router = Router();

const uploadAvatarMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for avatar
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WEBP images are allowed for avatars'));
    }
  },
});

const uploadFileMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for files
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP images or PDF files are allowed'));
    }
  },
});

router.get('/profile', authenticateJWT, getProfile);
router.patch('/profile', authenticateJWT, validate(updateProfileSchema), updateProfile);
router.post('/avatar', authenticateJWT, uploadAvatarMulter.single('avatar'), uploadAvatar);
router.post('/upload-file', authenticateJWT, uploadFileMulter.single('file'), uploadFile);

export { router as userRouter };
