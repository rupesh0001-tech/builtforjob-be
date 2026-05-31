import { Router } from 'express';
import { verifyOtp } from '../../controllers/auth/verify-otp.controller';
import { resendOtp } from '../../controllers/auth/resend-otp.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { verifyOTPSchema, resendOTPSchema } from '../../validators/auth.validator';

const router = Router();

router.post('/otp', validate(verifyOTPSchema), verifyOtp);
router.post('/resend-otp', validate(resendOTPSchema), resendOtp);

export { router as otpRouter };
