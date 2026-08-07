import z from 'zod';
import { inngest } from '~/lib/inngest/client';
import { fileDeleted } from '~/lib/inngest/event-types';

const bodySchema = z.object({
  fileIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (body.error || !body.data.fileIds.length) {
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
      select: { id: true },
    });

    await prisma.projectFile.deleteMany({
      where: { id: { in: filesToDelete.map((f) => f.id) } },
    });

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
    console.error('[DELETE /api/file/]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file',
    });
  }
});
