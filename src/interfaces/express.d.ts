import type { IJWTPayload } from './auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}
