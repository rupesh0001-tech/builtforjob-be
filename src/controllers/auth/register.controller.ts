import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { hashPassword } from '../../services/hash/hash.service';
import { sendOTPEmail } from '../../services/email/email.service';
import { generateOTPCode } from '../../utils/otp.util';
import { OTPType } from '@prisma/client';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    let user;
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already exists and is verified' });
      }
      
      const hashedPassword = await hashPassword(password);
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          firstName,
          lastName,
        },
      });
    } else {
      const hashedPassword = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });
    }

    const code = generateOTPCode();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate old OTPs
    await prisma.oTP.updateMany({
      where: {
        email,
        type: OTPType.REGISTRATION,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Create OTP
    await prisma.oTP.create({
      data: {
        email,
        code,
        type: OTPType.REGISTRATION,
        expiresAt,
        userId: user.id,
      },
    });

    await sendOTPEmail(email, code, firstName);

    return res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify.',
    });
  } catch (error) {
    next(error);
  }
}
