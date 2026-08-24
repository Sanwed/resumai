import { realtime } from 'inngest';
import z from 'zod';

export const analysisChannel = realtime.channel({
  name: ({ projectId, userId }: { projectId: string; userId: string }) => `user-${userId}-project-${projectId}`,
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
