import { z } from 'zod';

export const createResumeSchema = z.object({
  title: z.string().min(1).optional(),
  template: z.string().min(1).optional(),
  content: z.record(z.any()).optional(),
  isDraft: z.boolean().optional(),
  isMagic: z.boolean().optional(),
});

export const updateResumeSchema = createResumeSchema;

export const createResumeVersionSchema = z.object({
  company: z.string().optional(),
  role: z.string().min(1),
  content: z.record(z.any()),
});
