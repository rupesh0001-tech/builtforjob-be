import { Router } from 'express';
import { login } from '../../controllers/auth/login.controller';
import { register } from '../../controllers/auth/register.controller';
import { forgotPassword } from '../../controllers/auth/forgot-password.controller';
import { logout } from '../../controllers/auth/logout.controller';
import { 
  googleOAuthInit, 
  googleOAuthCallback, 
  githubOAuthInit, 
  githubOAuthCallback 
} from '../../controllers/auth/oauth.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forget/password', validate(forgotPasswordSchema), forgotPassword);
router.post('/logout', logout);

// OAuth Routes
router.get('/google', googleOAuthInit);
router.get('/google/callback', googleOAuthCallback);
router.get('/github', githubOAuthInit);
router.get('/github/callback', githubOAuthCallback);

export { router as authRouter };
