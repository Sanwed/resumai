import type z from 'zod';
import type { Analysis } from '~/generated/prisma/client';
import type { analysisRealtimeSchema } from '~/types/schema';

type Response = {
  data: z.infer<typeof analysisRealtimeSchema>;
};

export function useRealtimeConnection(projectId: string) {
  let source: EventSource | null = null;

  const { data: analyses } = useNuxtData<Analysis[]>(`project-analysis-${projectId}`);

  const connect = () => {
    source?.close();
    source = new EventSource(`/api/realtime/analysis?projectId=${projectId}`);
    source.onerror = (err) => {
      console.error('[realtime] connection error', err);
    };
    source.onmessage = (e) => {
      const message = JSON.parse(e.data) as Response;
      const payload = message.data;

      if (analyses.value) {
        if (payload.newAnalysis) {
          const index = analyses.value.findIndex((an) => an.id === payload.newAnalysis!.id);
          analyses.value =
            index === -1
              ? [...analyses.value, payload.newAnalysis]
              : analyses.value.map((an, i) => (i === index ? payload.newAnalysis! : an));
          return;
        } else {
          analyses.value = analyses.value.map((an) =>
            an.fileId === payload.fileId
              ? {
                  ...an,
                  status: payload.status,
                  statusMessage: payload.statusMessage ?? null,
                  progress: payload.progress ?? 0,
                }
              : an,
          );
        }
      }
    };
  };

  const disconnect = () => {
    source?.close();
    source = null;
  };

  return {
    connect,
    disconnect,
  };
}
