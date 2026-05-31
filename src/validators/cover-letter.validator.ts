import { z } from 'zod';

export const createCoverLetterSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  recipient: z.string().optional(),
  template: z.string().optional(),
  content: z.record(z.any()).optional(),
  isDraft: z.boolean().optional(),
  isMagic: z.boolean().optional(),
});

export const updateCoverLetterSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().optional(),
  recipient: z.string().optional(),
  template: z.string().optional(),
  content: z.record(z.any()).optional(),
  isDraft: z.boolean().optional(),
  isMagic: z.boolean().optional(),
});
