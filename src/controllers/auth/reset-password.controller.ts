import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { hashPassword } from '../../services/hash/hash.service';

/**
 * CRIT-03: Validates a single-use PasswordResetToken from the DB,
 * marks it as used, then updates the user's password.
 * This replaces the previous JWT-based approach which could not be invalidated.
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    // Look up the token in the database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }

    if (resetRecord.isUsed) {
      return res.status(400).json({ success: false, message: 'This reset link has already been used' });
    }

    if (new Date() > resetRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'This reset link has expired' });
    }

    // Mark the token as used (single-use)
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { isUsed: true },
    });

    // Update the user's password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
}
