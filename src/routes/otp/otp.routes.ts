import { Router } from 'express';
import { OtpController } from '../../controllers/auth/otp.controller';
import { validate } from '../../middlewares/validation/validator.middleware';
import { verifyOTPSchema } from '../../validators/auth.validator';

const router = Router();

router.post('/otp', validate(verifyOTPSchema), OtpController.verifyOtp as any);

export { router as otpRouter };
