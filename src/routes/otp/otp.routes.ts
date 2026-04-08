import { Router } from 'express';
import { OtpController } from '../../controllers/auth/otp.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { verifyOTPSchema, resendOTPSchema } from '../../validators/auth.validator';

const router = Router();
// /verify/otp
router.post('/otp', validate(verifyOTPSchema), OtpController.verifyOtp as any);
router.post('/resend-otp', validate(resendOTPSchema), OtpController.resendOTP as any);

export { router as otpRouter };
