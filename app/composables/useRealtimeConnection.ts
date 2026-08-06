import type z from 'zod';
import type { analysisRealtimeSchema } from '~/types/schema';

type Response = {
  data: z.infer<typeof analysisRealtimeSchema>;
};

export function useRealtimeConnection(projectId: string) {
  let source: EventSource | null = null;
  const message = ref<Response>();

  const connect = () => {
    source?.close();
    source = new EventSource(`/api/realtime/analysis?projectId=${projectId}`);
    source.onmessage = (e) => {
      message.value = JSON.parse(e.data) as Response;
    };
  };

  const disconnect = () => {
    source?.close();
    source = null;
  };

  return {
    message,
    connect,
    disconnect,
  };
}
