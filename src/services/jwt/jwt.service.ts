import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.config';
import type { IJWTPayload } from '../../interfaces/auth.interface';

export function generateToken(payload: IJWTPayload, expiresIn?: string): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: (expiresIn || jwtConfig.expiresIn) as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): IJWTPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as IJWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function decodeToken(token: string): IJWTPayload | null {
  try {
    return jwt.decode(token) as IJWTPayload;
  } catch {
    return null;
  }
}
