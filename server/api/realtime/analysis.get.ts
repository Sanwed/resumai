import z from 'zod';
import { subscribe } from 'inngest/realtime';
import { inngest } from '~/lib/inngest/client';
import { analysisChannel } from '~/lib/inngest/channels';

const querySchema = z.object({ projectId: z.string() });

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (!query.data || query.error) {
    throw createError({
      statusCode: 400,
      message: 'Project id is required',
    });
  }

  const ch = analysisChannel({ projectId: query.data.projectId });

  try {
    const stream = await subscribe({
      app: inngest,
      channel: ch,
      topics: ['status', 'notification'],
    });

    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    return stream.getEncodedStream();
  } catch (error) {
    console.error('[realtime] subscribe failed', error);

    throw createError({
      statusCode: 503,
      statusMessage: 'Realtime subscription unavailable',
    });
  }
});
