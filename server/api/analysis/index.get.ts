import { analysisQuerySchema } from '#server/types/schema';

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => analysisQuerySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  try {
    const analysis = await prisma.analysis.findMany({
      where: {
        projectId: query.data.projectId,
        userId: event.context.user.id,
      },
    });

    return analysis;
  } catch (error) {
    console.error('[GET] /api/analysis]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analyses',
    });
  }
});
