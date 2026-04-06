import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../services/jwt/jwt.service';
import { IJWTPayload } from '../../interfaces/auth.interface';

export interface AuthRequest extends Request {
  user?: IJWTPayload;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = JWTService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};
