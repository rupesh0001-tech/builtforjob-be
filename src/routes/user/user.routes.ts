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
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', authenticateJWT, getProfile);
router.patch('/profile', authenticateJWT, validate(updateProfileSchema), updateProfile);
router.post('/avatar', authenticateJWT, upload.single('avatar'), uploadAvatar);
router.post('/upload-file', authenticateJWT, upload.single('file'), uploadFile);

export { router as userRouter };
