import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { comparePassword } from '../../services/hash/hash.service';
import { generateToken } from '../../services/jwt/jwt.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    if (user.isBanned) {
      if (user.bannedUntil && user.bannedUntil < new Date()) {
        // Auto unban
        await prisma.user.update({
          where: { id: user.id },
          data: { isBanned: false, bannedUntil: null, banReason: null }
        });
      } else {
        const banExpiryMsg = user.bannedUntil
          ? ` until ${new Date(user.bannedUntil).toLocaleDateString()}`
          : " permanently";
        return res.status(403).json({
          success: false,
          message: `Your account has been banned${banExpiryMsg}. Reason: ${user.banReason || 'No reason specified'}`
        });
      }
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created via social login. Please sign in with Google or GitHub.'
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileSynced: user.profileSynced,
        }
      },
    });
  } catch (error) {
    next(error);
  }
}
