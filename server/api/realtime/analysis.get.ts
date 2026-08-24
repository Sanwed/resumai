import z from 'zod';
import { subscribe } from 'inngest/realtime';
import { inngest } from '#server/lib/inngest/client';
import { analysisChannel } from '#server/lib/inngest/channels';

const querySchema = z.object({ projectId: z.string() });

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: query.data.projectId,
      userId: event.context.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project not found',
    });
  }

  const ch = analysisChannel({
    projectId: project.id,
    userId: event.context.user.id,
  });

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
    console.error('[GET] /realtime/analysis', error);

    throw createError({
      statusCode: 503,
      statusMessage: 'Realtime subscription unavailable',
    });
  }
});
