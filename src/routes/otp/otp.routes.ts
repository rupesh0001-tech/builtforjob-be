import { Router } from 'express';
import { verifyOtp } from '../../controllers/auth/verify-otp.controller';
import { resendOtp } from '../../controllers/auth/resend-otp.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { verifyOTPSchema, resendOTPSchema } from '../../validators/auth.validator';
import { authRateLimiter } from '../../middlewares/rate-limit/rate-limiter';

const router = Router();

// HIGH-03: Rate limit OTP endpoints to mitigate brute-force attacks
router.post('/otp', authRateLimiter, validate(verifyOTPSchema), verifyOtp);
router.post('/resend-otp', authRateLimiter, validate(resendOTPSchema), resendOtp);

export { router as otpRouter };
