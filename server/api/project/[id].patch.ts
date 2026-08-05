import { projectUpdateSchema } from '~/types/schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  const body = await readValidatedBody(event, (body) => projectUpdateSchema.safeParse(body));

  if (body.error) {
    throw createError({
      statusCode: 400,
      message: 'Something went wrong',
    });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: {
        id,
        userId: event.context.user.id,
      },
      data: body.data,
    });

    return updatedProject;
  } catch (error) {
    console.error('[PATCH /api/project/:id]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update project',
    });
  }
});
