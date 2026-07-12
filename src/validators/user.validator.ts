import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  profileSynced: z.boolean().optional(),
  socialLinks: z.object({
    github: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    portfolio: z.string().url().or(z.literal('')).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    isFresher: z.boolean().optional(),
    noProjects: z.boolean().optional(),
  }).nullable().optional(),
  skills: z.array(z.object({
    name: z.string().min(1),
    isGithubSynced: z.boolean().optional(),
  })).optional(),
  experience: z.array(z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    startDate: z.string(),
    endDate: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    isCurrent: z.boolean().optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    graduationDate: z.string(),
    gpa: z.string().nullable().optional(),
    graduationType: z.string().nullable().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().min(1),
    techStack: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    isGithubSynced: z.boolean().optional(),
  })).optional(),
});
