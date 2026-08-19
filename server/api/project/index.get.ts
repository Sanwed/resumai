export default defineEventHandler(async (event) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: event.context.user.id,
      },
    });

    return projects;
  } catch (error) {
    console.error('[GET] /api/project', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch projects',
    });
  }
});
