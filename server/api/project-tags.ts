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

      if (!query.data) {
        throw new Error("Пользователь не найден");
      }

      const project = await prisma.projects.findUnique({
        where: {
          id: query.data?.projectId,
        },
        include: {
          tags: true,
        },
      });

      if (!project) {
        throw new Error("Проект не найден");
      }

      return project.tags;
    } catch (error) {
      console.error("Ошибка при получении проектов:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Ошибка при получении проектов",
      });
    }
  }
});
