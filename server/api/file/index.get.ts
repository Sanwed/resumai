import z from 'zod';

const querySchema = z.object({
  projectId: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

    if (!query.data || query.error) {
      throw createError({
        statusCode: 400,
        message: 'Project id is required',
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
    console.error('[GET] /api/file/]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch files',
    });
  }
});
