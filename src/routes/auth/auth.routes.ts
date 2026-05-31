import { Router } from 'express';
import { login } from '../../controllers/auth/login.controller';
import { register } from '../../controllers/auth/register.controller';
import { forgotPassword } from '../../controllers/auth/forgot-password.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forget/password', validate(forgotPasswordSchema), forgotPassword);

export { router as authRouter };
