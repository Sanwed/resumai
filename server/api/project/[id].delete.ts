export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  try {
    const deletedProject = await prisma.project.delete({
      where: {
        id,
      },
    });

    return deletedProject;
  } catch (error) {
    console.error('[DELETE /api/project/:id]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete project',
    });
  }
});
