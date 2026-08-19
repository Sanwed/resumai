import { eventType } from 'inngest';
import z from 'zod';

export const fileUploaded = eventType('app/file.uploaded', {
  schema: z.object({
    userId: z.string(),
    projectId: z.string(),
    fileId: z.string(),
  }),
});

export const fileDeleted = eventType('app/file.deleted', {
  schema: z.object({
    userId: z.string(),
    fileId: z.string(),
  }),
});

export const analysisFinished = eventType('app/analysis.finished', {
  schema: z.object({
    projectId: z.string(),
    userId: z.string(),
    title: z.string(),
    message: z.string().optional(),
    link: z.string().optional(),
  }),
});
