export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, (body) => projectCreateSchema.safeParse(body));

    if (body.error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Incorrect body data',
      });
    }

    const project = await prisma.project.create({
      data: {
        ...body.data,
        userId: event.context.user.id,
      },
    });

    return project;
  } catch (error) {
    console.error('[POST] /api/project', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create project',
    });
  }
});
