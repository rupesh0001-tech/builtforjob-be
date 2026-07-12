import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { sendPasswordResetEmail } from '../../services/email/email.service';
import { randomBytes } from 'crypto';

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    // Always return the same generic message to prevent user enumeration
    const genericResponse = { success: true, message: 'If this email is registered, a password reset link will be sent.' };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json(genericResponse);
    }

    // CRIT-03: Use a cryptographically random, DB-persisted, single-use token
    // instead of a JWT (which cannot be invalidated)
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    // Store the new single-use token
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: rawToken, expiresAt },
    });

    await sendPasswordResetEmail(email, rawToken, user.firstName);

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
}
