import z from 'zod';
import { inngest } from '#server/lib/inngest/client';
import { fileDeleted } from '#server/lib/inngest/event-types';
import { del } from '@vercel/blob';

const bodySchema = z.object({
  fileIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (body.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File ids are not provided',
    });
  }

  try {
    const filesToDelete = await prisma.projectFile.findMany({
      where: {
        id: { in: body.data.fileIds },
        project: { userId: event.context.user.id },
      },
      select: { id: true, url: true },
    });

    await prisma.projectFile.deleteMany({
      where: { id: { in: filesToDelete.map((f) => f.id) } },
    });

    await del(filesToDelete.map((el) => el.url));

    await inngest.send(
      filesToDelete.map((f) =>
        fileDeleted.create({
          userId: event.context.user.id,
          fileId: f.id,
        }),
      ),
    );

    return filesToDelete.map((el) => el.id);
  } catch (error) {
    console.error('[DELETE] /api/file', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete files',
    });
  }
});
