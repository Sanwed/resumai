import z from 'zod';
import { inngest } from '#server/lib/inngest/index';
import { fileUploaded } from '#server/lib/inngest/event-types';
import { analysisQuerySchema } from '#server/types/schema';

const bodySchema = z.object({
  fileIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => analysisQuerySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      message: 'Project id is required',
    });
  }

  const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (body.error) {
    throw createError({
      statusCode: 400,
      message: 'Body is empty',
    });
  }

  const fileIds = [...new Set(body.data.fileIds)];

  const [project, files] = await Promise.all([
    prisma.project.findUnique({
      where: {
        id: query.data.projectId,
        userId: event.context.user.id,
      },
      select: {
        id: true,
      },
    }),
    prisma.projectFile.findMany({
      where: {
        id: { in: fileIds },
        projectId: query.data.projectId,
        userId: event.context.user.id,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!project || files.length !== fileIds.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project or files not found',
    });
  }

  for (const id of fileIds) {
    await inngest.send(
      fileUploaded.create({
        userId: event.context.user.id,
        projectId: query.data.projectId,
        fileId: id,
      }),
    );
  }
});
