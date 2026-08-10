import * as z from 'zod';
import { AnalysisStatus, ProjectColor } from '~/generated/prisma/enums';

export const projectSchema = z.object({
  name: z.string(),
  id: z.string(),
  vacancyText: z.string().nullable(),
  userId: z.string(),
  color: z.enum(ProjectColor),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const projectCreateSchema = projectSchema.pick({ name: true }).extend({
  name: z
    .string({ error: 'Enter project name' })
    .min(1, 'Enter project name')
    .max(255, 'Max characters limit exceeded'),
});

export const projectUpdateSchema = projectSchema
  .pick({ name: true, color: true, vacancyText: true })
  .partial()
  .extend({
    name: z
      .string({ error: 'Enter project name' })
      .min(1, 'Enter project name')
      .max(255, 'Max characters limit exceeded')
      .optional(),
    vacancyText: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userUpdateSchema = userSchema
  .pick({ name: true, email: true })
  .partial()
  .extend({
    name: z
      .string({ error: 'Enter user name' })
      .min(1, 'Enter user name')
      .max(255, 'Max characters limit exceeded')
      .optional(),
    email: z.email('Invalid email').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string().nullable(),
  link: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.coerce.date(),
});

export const analysisSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string(),
  fileId: z.string(),
  candidateName: z.string().nullable(),
  compatibility: z.number().int().nullable(),
  verdict: z.string().nullable(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  skills: z.array(z.string()),
  relevantExperienceYears: z.number().nullable(),
  redFlags: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  website: z.string().nullable(),
  vacancyHash: z.string().nullable(),
  status: z.enum(AnalysisStatus),
  statusMessage: z.string().nullable(),
  progress: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  incomplete: z.boolean().nullable().default(false),
  incompleteReason: z.string().nullable().default(''),
});

export const analysisAIResponseSchema = analysisSchema.omit({
  id: true,
  userId: true,
  projectId: true,
  fileId: true,
  status: true,
  statusMessage: true,
  progress: true,
  vacancyHash: true,
  createdAt: true,
  updatedAt: true,
});

export const analysisRealtimeSchema = z.object({
  fileId: z.string(),
  status: z.enum(AnalysisStatus),
  statusMessage: z.string().optional(),
  progress: z.number().optional(),
  newAnalysis: analysisSchema.optional(),
});
