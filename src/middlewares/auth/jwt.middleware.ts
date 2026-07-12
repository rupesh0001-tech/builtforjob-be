import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../services/jwt/jwt.service';
import prisma from '../../config/db.config';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.token;

    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    try {
      const decoded = verifyToken(token);
      
      if (decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { isBanned: true, bannedUntil: true, banReason: true }
        });
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
          });
        }

        if (user.isBanned) {
          if (user.bannedUntil && user.bannedUntil < new Date()) {
            // Auto unban if duration expired
            await prisma.user.update({
              where: { id: decoded.userId },
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
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        // HIGH-06: Never expose raw error objects to the client
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};
