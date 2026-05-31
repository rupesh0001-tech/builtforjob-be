import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body); 
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errorMessages,
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

export const validateFile = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(' [File Validation Debug] ', {
          hasFile: !!req.file,
          fileField: req.file?.fieldname,
          mimetype: req.file?.mimetype,
          bodyFields: Object.keys(req.body)
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          errors: [{ field: 'resume', message: 'Please upload a PDF resume file' }],
        });
      }

      await schema.parseAsync(req.file);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'File validation error',
          errors: errorMessages,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};
