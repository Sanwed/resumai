export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, 'id');

    if (!projectId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project id is required',
      });
    }

    const files = await prisma.projectFile.findMany({
      where: {
        projectId,
      },
    });

    return files;
  } catch (error) {
    console.error('[GET] /api/file/:id]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch files',
    });
  }
});
