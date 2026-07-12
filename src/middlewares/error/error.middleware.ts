import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { IHttpError } from '../../interfaces/error.interface';

export const errorMiddleware: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = (err as Partial<IHttpError>).statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Always log detailed errors server-side
  console.error(' [Backend Error Log] ');
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  console.error(`Error: ${err.message || err}`);
  if (err.stack) {
    console.error(`Stack: ${err.stack}`);
  }
  console.error('----------------------');

  // 1. Prisma Unique Constraint Error (P2002) - e.g. Email duplication
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const isEmail = Array.isArray(target) && (target.includes('email') || target.includes('userId_name'));
    statusCode = 400;
    message = isEmail ? 'This email is already registered.' : 'This item already exists.';
  }
  // 2. General Prisma errors, SQL, PG, Database driver errors, or internal 500 errors
  // HIGH-05: Never expose internal DB/stack details to the client in production
  else if (
    err.name?.startsWith('Prisma') ||
    (err.code && typeof err.code === 'string' && err.code.startsWith('P')) ||
    err.message?.toLowerCase().includes('database') ||
    err.message?.toLowerCase().includes('sql') ||
    err.message?.toLowerCase().includes('postgres') ||
    err.stack?.toLowerCase().includes('postgres') ||
    statusCode === 500
  ) {
    statusCode = 500;
    // In production: always return a generic message to prevent information leakage
    message = process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please try again later.'
      : (err.message || 'Something went wrong. Please try again.');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
