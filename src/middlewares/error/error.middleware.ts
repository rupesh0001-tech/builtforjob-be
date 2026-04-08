import type { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Only log to console if in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error(' [Backend Error Log] ');
    console.error(`Path: ${req.path}`);
    console.error(`Method: ${req.method}`);
    console.error(`Error: ${message}`);
    console.error(`Stack: ${err.stack}`);
    console.error('----------------------');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
