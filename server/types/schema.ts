import z from 'zod';

export const analysisQuerySchema = z.object({
  projectId: z.string(),
});

export const fileQuerySchema = z.object({
  projectId: z.string(),
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
