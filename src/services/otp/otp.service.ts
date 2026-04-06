import prisma from '../../config/database/db';
import { OTPType } from '@prisma/client';

export class OTPService {
  private static generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(email: string, type: OTPType, userId?: string): Promise<string> {
    const code = this.generateOTPCode();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate any existing unused OTPs for this email and type
    await prisma.oTP.updateMany({
      where: {
        email,
        type,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new OTP
    await prisma.oTP.create({
      data: {
        email,
        code,
        type,
        expiresAt,
        userId,
      },
    });

    return code;
  }

  static async verifyOTP(email: string, code: string, type: OTPType): Promise<{ isValid: boolean; message: string }> {
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        type,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return { isValid: false, message: 'Invalid OTP code' };
    }

    if (new Date() > otp.expiresAt) {
      return { isValid: false, message: 'OTP has expired' };
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    return { isValid: true, message: 'OTP verified successfully' };
  }
}
