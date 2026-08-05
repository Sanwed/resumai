import * as z from 'zod';
import { ProjectColor } from '~/generated/prisma/enums';

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
  image: z.string().url().nullable().optional(),
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
