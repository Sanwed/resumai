import { eventType } from 'inngest';
import z from 'zod';

export const fileUploaded = eventType('app/file.uploaded', {
  schema: z.object({
    projectId: z.string(),
    fileId: z.string(),
  }),
});
