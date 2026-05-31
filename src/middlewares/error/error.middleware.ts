import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { IHttpError } from '../../interfaces/error.interface';

export const errorMiddleware: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as Partial<IHttpError>).statusCode || 500;
  const message = err.message || 'Internal Server Error';

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
