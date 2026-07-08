import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../services/jwt/jwt.service';
import prisma from '../../config/db.config';

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.token;

    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    try {
      const decoded = verifyToken(token);
      
      if (!decoded.adminId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access restricted to administrators',
        });
      }

      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
        select: { id: true, email: true, name: true }
      });

      if (!admin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Admin account not found',
        });
      }

      req.user = decoded; // Keep compatible with req.user references if any
      (req as any).admin = admin; // Attach admin details to request
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};
