import { realtime } from 'inngest';
import z from 'zod';
import { analysisRealtimeSchema, notificationSchema } from '~/types/schema';

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
