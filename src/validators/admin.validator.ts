import { z } from 'zod';

// MEDIUM-08: Zod schemas for admin mutation endpoints

export const adminCreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  jobTitle: z.string().max(200).optional(),
  tokens: z.number().min(0).max(1000).optional(),
  plan: z.enum(['FREE', 'PRO']).optional(),
});

export const adminUpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  jobTitle: z.string().max(200).nullable().optional(),
});

export const adminUpdatePlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO'], { required_error: 'Plan must be FREE or PRO' }),
});

export const adminUpdateTokensSchema = z.object({
  tokens: z.number({ required_error: 'Tokens must be a number' }).min(0).max(10000),
});

export const adminUpdateBanSchema = z.object({
  isBanned: z.boolean({ required_error: 'isBanned must be a boolean' }),
  days: z.number().int().min(1).max(3650).optional(),
  reason: z.string().max(500).nullable().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(128),
});
