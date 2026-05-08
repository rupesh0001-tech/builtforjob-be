import { z } from 'zod';

// ─── Body schema ────────────────────────────────────────────────────────────
// Validates the text fields sent alongside the multipart upload.

export const atsCheckSchema = z.object({
  jobDescription: z
    .string({ required_error: 'Job description is required' })
    .trim()
    .min(20, 'Job description must be at least 20 characters')
    .max(10000, 'Job description must not exceed 10 000 characters'),
});

// ─── File schema ─────────────────────────────────────────────────────────────
// Used by the validateFile middleware to assert the uploaded file is a valid PDF.

export const atsFileSchema = z.object({
  mimetype: z.literal('application/pdf', {
    errorMap: () => ({ message: 'Only PDF files are accepted' }),
  }),
  size: z
    .number()
    .max(5 * 1024 * 1024, 'File size must not exceed 5 MB'),
  originalname: z.string().min(1, 'File name is required'),
});

export type AtsCheckBody = z.infer<typeof atsCheckSchema>;
