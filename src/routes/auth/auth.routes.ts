import { Router } from 'express';
import { login } from '../../controllers/auth/login.controller';
import { register } from '../../controllers/auth/register.controller';
import { forgotPassword } from '../../controllers/auth/forgot-password.controller';
import { resetPassword } from '../../controllers/auth/reset-password.controller';
import { logout } from '../../controllers/auth/logout.controller';
import {
  googleOAuthInit,
  googleOAuthCallback,
  githubOAuthInit,
  githubOAuthCallback
} from '../../controllers/auth/oauth.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../validators/auth.validator';
import { authRateLimiter } from '../../middlewares/rate-limit/rate-limiter';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/forget/password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/logout', logout);

// OAuth Routes
router.get('/google', googleOAuthInit);
router.get('/google/callback', googleOAuthCallback);
router.get('/github', githubOAuthInit);
router.get('/github/callback', githubOAuthCallback);

export { router as authRouter };
