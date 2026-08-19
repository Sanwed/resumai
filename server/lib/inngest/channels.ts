import { realtime } from 'inngest';
import z from 'zod';

export const analysisChannel = realtime.channel({
  name: ({ projectId }: { projectId: string }) => `project-${projectId}`,
  topics: {
    status: {
      schema: analysisRealtimeSchema,
    },
    notification: {
      schema: z.object({
        notification: notificationSchema.optional(),
      }),
    },
  },
});
