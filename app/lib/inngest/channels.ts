import { realtime } from 'inngest';
import { analysisRealtimeSchema } from '~/types/schema';

export const analysisChannel = realtime.channel({
  name: ({ projectId }: { projectId: string }) => `project-${projectId}`,
  topics: {
    status: {
      schema: analysisRealtimeSchema,
    },
  },
});
