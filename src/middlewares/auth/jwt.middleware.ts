import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../services/jwt/jwt.service';

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
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error : error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};
