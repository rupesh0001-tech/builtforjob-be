import { z } from 'zod';

export const createApplicationVersionSchema = z.object({
  versionName: z.string().min(1, 'Version name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  resumeId: z.string().optional(),
  resumeUrl: z.string().optional(),
  coverLetterUrl: z.string().optional(),
});
