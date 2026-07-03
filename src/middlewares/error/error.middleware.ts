import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { IHttpError } from '../../interfaces/error.interface';

export const errorMiddleware: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = (err as Partial<IHttpError>).statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error(' [Backend Error Log] ');
    console.error(`Path: ${req.path}`);
    console.error(`Method: ${req.method}`);
    console.error(`Error: ${message}`);
    console.error(`Stack: ${err.stack}`);
    console.error('----------------------');
  }

  // 1. Prisma Unique Constraint Error (P2002) - e.g. Email duplication
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const isEmail = Array.isArray(target) && (target.includes('email') || target.includes('userId_name'));
    statusCode = 400;
    message = isEmail ? 'This email is already registered.' : 'This item already exists.';
  }
  // 2. General Prisma errors (starts with P or name includes Prisma)
  else if (err.name?.startsWith('Prisma') || (err.code && typeof err.code === 'string' && err.code.startsWith('P'))) {
    statusCode = 500;
    message = 'Something went wrong. Please try again.';
  }
  // 3. SQL / PG driver errors
  else if (
    err.message?.toLowerCase().includes('database') || 
    err.message?.toLowerCase().includes('sql') || 
    err.message?.toLowerCase().includes('postgres') || 
    err.stack?.toLowerCase().includes('postgres')
  ) {
    statusCode = 500;
    message = 'Unable to process your request.';
  }
  // 4. Default production sanitization for internal server errors
  else if (statusCode === 500 && process.env.NODE_ENV !== 'development') {
    message = 'Something went wrong. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
