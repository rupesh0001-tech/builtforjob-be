import { Router } from 'express';
import { UserController } from '../../controllers/user/user.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { validate } from '../../middlewares/validation/validator.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resendOTPSchema } from '../../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), UserController.register);
router.post('/login', validate(loginSchema), UserController.login);
router.post('/forget/password', validate(forgotPasswordSchema), UserController.forgotPassword);
router.get('/profile', authenticateJWT, UserController.getProfile as any);
router.patch('/profile', authenticateJWT, UserController.updateProfile as any);

export { router as userRouter };
