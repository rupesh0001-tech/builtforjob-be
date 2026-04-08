import type { Request, Response, NextFunction } from 'express';
import { OTPService } from '../../services/otp/otp.service';
import { UserService } from '../../services/auth/user.service';
import { EmailService } from '../../services/email/email.service';
import { JWTService } from '../../services/jwt/jwt.service';
import { OTPType } from '@prisma/client';

export class OtpController {
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, type } = req.body;
      
      const verificationResult = await OTPService.verifyOTP(email, otp, type as OTPType);

      if (!verificationResult.isValid) {
        return res.status(400).json({ success: false, message: verificationResult.message });
      }

      // If registration, verify user
      if (type === OTPType.REGISTRATION) {
        const user = await UserService.findByEmail(email);
        if (user) {
          await UserService.verifyUser(user.id);
          
          const token = JWTService.generateToken({ userId: user.id, email: user.email });

          return res.json({
            success: true,
            message: 'Email verified successfully',
            data: { token, user: { id: user.id, email: user.email } }
          });
        }
      }

      return res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type } = req.body;

      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (type === OTPType.REGISTRATION && user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email is already verified' });
      }

      // Generate new OTP
      const otp = await OTPService.createOTP(email, type as OTPType, user.id);

      // Send OTP via Email
      await EmailService.sendOTPEmail(email, otp, user.firstName);

      return res.json({
        success: true,
        message: 'A new OTP has been sent to your email',
      });
    } catch (error) {
      next(error);
    }
  }
}
