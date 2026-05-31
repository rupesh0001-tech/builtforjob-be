import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { sendPasswordResetEmail } from '../../services/email/email.service';
import { generateToken } from '../../services/jwt/jwt.service';

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, a reset link will be sent' });
    }

    const resetToken = generateToken({ userId: user.id, email: user.email }, '1h');
    
    await sendPasswordResetEmail(email, resetToken, user.firstName);

    return res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    next(error);
  }
}
