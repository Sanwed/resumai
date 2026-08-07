export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File id is required',
    });
  }

  try {
    const deletedFile = await prisma.projectFile.delete({
      where: {
        id,
        userId: event.context.user.id,
      },
    });

    return deletedFile;
  } catch (error) {
    console.error('[DELETE /api/file/:id]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete file',
    });
  }
});
