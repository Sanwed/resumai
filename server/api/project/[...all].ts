import { prisma } from '~/lib/auth';

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
        where: {
          userId: event.context.user.id,
        },
      });

      return projects;
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Ошибка сервера',
      });
    }
  }
  // if (event.method === 'DELETE') {
  //   const query = await getValidatedQuery(event, (query) => projectQuerySchema.safeParse(query));

  //   if (!query.data || query.error) {
  //     throw createError({
  //       statusCode: 400,
  //       message: query.error.message,
  //     });
  //   }

  //   const deletedProject = await prisma.project.delete({
  //     where: {
  //       id: query.data.projectId ?? undefined,
  //     },
  //   });

  //   return deletedProject;
  // }
});
