import { del } from '@vercel/blob';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  try {
    const filesToDelete = await prisma.projectFile.findMany({
      where: { userId: event.context.user.id, projectId: id },
      select: { url: true },
    });

    await del(filesToDelete.map((el) => el.url));

    const deletedProject = await prisma.project.delete({
      where: {
        id,
        userId: event.context.user.id,
      },
    });

    return deletedProject;
  } catch (error) {
    console.error('[DELETE] /api/project/:id', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete project',
    });
  }
});
