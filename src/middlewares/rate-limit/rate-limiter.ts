import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

// Cleanup stale entries in the store every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key based on IP + endpoint
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = store.get(key);

    if (!record) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(key, record);
      return next();
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
      store.set(key, record);
      return next();
    }

    record.count++;
    if (record.count > options.max) {
      return res.status(429).json({
        success: false,
        message: options.message,
      });
    }

    next();
  };
}

// 1. Strict Limiter for Auth / OTP
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

// 2. Moderate Limiter for AI Generation
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests
  message: 'AI content generation limit reached. Please try again in an hour.'
});

// 3. Moderate Limiter for Resume Scan
export const scanRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 scans
  message: 'Resume scanning limit reached. Please try again in an hour.'
});

// 4. Relaxed Limiter for General / Public APIs
export const publicRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests
  message: 'Too many requests. Please slow down.'
});
