import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { generateToken } from '../../services/jwt/jwt.service';
import { OTPType } from '@prisma/client';

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, type } = req.body;

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        type: type as OTPType,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // If registration, verify user
    if (type === OTPType.REGISTRATION) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
        
        const token = generateToken({ userId: user.id, email: user.email });

        return res.json({
          success: true,
          message: 'Email verified successfully',
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileSynced: user.profileSynced,
            }
          }
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
