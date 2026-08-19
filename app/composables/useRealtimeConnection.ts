import type z from 'zod';
import type { Analysis, Notification } from '~/generated/prisma/client';
import type {} from '~/types/schema';

type Response =
  | { topic: 'status'; data: z.infer<typeof analysisRealtimeSchema> }
  | { topic: 'notification'; data: { notification?: z.infer<typeof notificationSchema> } };

export function useRealtimeConnection(projectId: string) {
  let source: EventSource | null = null;

  const { data: analyses } = useNuxtData<Analysis[]>(`project-analysis-${projectId}`);
  const { data: notifications } = useNuxtData<Notification[]>('notifications');

  const error = ref<string>();

  const handleStatusMessage = (payload: z.infer<typeof analysisRealtimeSchema>) => {
    if (!analyses.value) return;

    if (payload.newAnalysis) {
      const index = analyses.value.findIndex((an) => an.id === payload.newAnalysis!.id);
      analyses.value =
        index === -1
          ? [...analyses.value, payload.newAnalysis]
          : analyses.value.map((an, i) => (i === index ? payload.newAnalysis! : an));
      return;
    }

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
  };

  const handleNotificationMessage = (payload: { notification?: Notification }) => {
    console.log(payload);

    if (!payload.notification || !notifications.value) return;

    const incoming = payload.notification;
    const index = notifications.value.findIndex((n) => n.id === incoming.id);

    notifications.value =
      index === -1
        ? [incoming, ...notifications.value]
        : notifications.value.map((n, i) => (i === index ? incoming : n));
  };

  const connect = () => {
    source?.close();
    source = new EventSource(`/api/realtime/analysis?projectId=${projectId}`);
    source.onerror = () => {
      error.value = 'Realtime connection lost. Please refresh to reconnect.';
      console.error('[realtime] connection closed permanently', { projectId });
    };
    source.onmessage = (e) => {
      const message = JSON.parse(e.data) as Response;

      switch (message.topic) {
        case 'status':
          handleStatusMessage(message.data);
          break;
        case 'notification':
          handleNotificationMessage(message.data);
          break;
      }
    };
  };

  const disconnect = () => {
    source?.close();
    source = null;
  };

  return {
    error,
    connect,
    disconnect,
  };
}
