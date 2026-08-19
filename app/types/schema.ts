import z from 'zod';

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
