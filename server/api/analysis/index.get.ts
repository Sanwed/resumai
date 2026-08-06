import z from 'zod';

const querySchema = z.object({
  projectId: z.string(),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (!query.data || query.error) {
    throw createError({
      statusCode: 400,
      message: 'Project id is required',
    });
  }

  try {
    const analysis = await prisma.analysis.findMany({
      where: {
        projectId: query.data.projectId,
      },
    });

    return analysis;
  } catch (error) {
    console.error('[GET] /api/analysis]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analysis',
    });
  }
});
