import { fileQuerySchema } from '#server/types/schema';

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (query) => fileQuerySchema.safeParse(query));

    if (query.error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project id is required',
      });
    }

    const files = await prisma.projectFile.findMany({
      where: {
        projectId: query.data.projectId,
        userId: event.context.user.id,
      },
    });

    return files;
  } catch (error) {
    console.error('[GET] /api/file', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch files',
    });
  }
});
