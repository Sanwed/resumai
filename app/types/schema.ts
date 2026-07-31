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
  .pick({ name: true, color: true })
  .partial()
  .extend({
    name: z
      .string({ error: 'Enter project name' })
      .min(1, 'Enter project name')
      .max(255, 'Max characters limit exceeded')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
