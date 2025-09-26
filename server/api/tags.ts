import z from "zod";
import { prisma } from "~/lib/auth";

const tagsQuerySchema = z.object({
  projectId: z.string(),
});

export default defineEventHandler(async (event) => {
  if (event.method === "GET") {
    try {
      const query = await getValidatedQuery(event, (query) =>
        tagsQuerySchema.safeParse(query)
      );

      if (query.data) {
        const project = await prisma.projects.findUnique({
          where: {
            id: query.data?.projectId,
          },
          include: {
            tags: true,
          },
        });

        if (!project) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Проект не найден'
          });
        }

        return project.tags;
      }

      const tags = await prisma.tags.findMany();
      return tags;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          error instanceof Error ? error.message : "Ошибка сервера",
      });
    }
  }
});
