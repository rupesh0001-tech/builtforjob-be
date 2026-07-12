import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { sendOTPEmail } from '../../services/email/email.service';
import { generateOTPCode } from '../../utils/otp.util';
import { OTPType } from '@prisma/client';

export async function resendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, type } = req.body;

    // MEDIUM-01: Always return a generic message regardless of whether the email exists
    // to prevent user enumeration attacks
    const genericResponse = { success: true, message: 'If this email is registered, a new OTP will be sent.' };

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.json(genericResponse);
    }

    if (type === OTPType.REGISTRATION && user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Cooldown check (30 seconds)
    const lastOtp = await prisma.oTP.findFirst({
      where: {
        email,
        type: type as OTPType,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastOtp) {
      const timePassedMs = Date.now() - new Date(lastOtp.createdAt).getTime();
      const cooldownMs = 30 * 1000;
      if (timePassedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timePassedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate new OTP
    const code = generateOTPCode();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate old OTPs
    await prisma.oTP.updateMany({
      where: {
        email,
        type: type as OTPType,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new OTP record
    await prisma.oTP.create({
      data: {
        email,
        code,
        type: type as OTPType,
        expiresAt,
        userId: user.id,
      },
    });

    await sendOTPEmail(email, code, user.firstName);

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
}
