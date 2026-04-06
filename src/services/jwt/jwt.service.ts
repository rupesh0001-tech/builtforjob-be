import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt/jwt.config';
import { IJWTPayload } from '../../interfaces/auth.interface';

export class JWTService {
  static generateToken(payload: IJWTPayload, expiresIn?: string): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: expiresIn || jwtConfig.expiresIn,
    });
  }

  static verifyToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as IJWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): IJWTPayload | null {
    try {
      return jwt.decode(token) as IJWTPayload;
    } catch {
      return null;
    }
  }
}
