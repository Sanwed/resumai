import z from "zod";
import { auth, prisma } from "~/lib/auth";

const projectQuerySchema = z.object({
  userId: z.string(),
});

const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Введите имя")
    .max(255, "Превышено максимальное количество символов"),
  description: z.string().nullish(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      variant: z.enum(["green", "red", "orange", "blue", "neutral"]).nullable(),
    })
  ),
  vacancyText: z.string().min(1, "Введите корректное описание вакансии"),
  endDate: z.string().nullish(),
});

export default defineEventHandler(async (event) => {
  if (event.method === "GET") {
    try {
      const query = await getValidatedQuery(event, (query) =>
        projectQuerySchema.safeParse(query)
      );

      if (!query.data) {
        throw new Error("Пользователь не найден");
      }

      const projects = await prisma.projects.findMany({
        where: {
          userId: query.data.userId,
        },
      });

      return projects;
    } catch (error) {
      console.error("Ошибка при получении проектов:", error);
      return [];
    }
  }
  if (event.method === "POST") {
    try {
      const session = await auth.api.getSession({
        headers: event.headers,
      });

      if (!session) {
        throw new Error("Необходимо авторизоваться");
      }

      const body = await readValidatedBody(event, (body) => projectCreateSchema.safeParse(body));

      if (body.error) {
        throw new Error("Не заполнены обязательные поля");
      }

      const project = await prisma.projects.create({
        data: {
          ...body.data,
          userId: session.user.id,
          tags: {
            connect: body.data.tags && body.data.tags.map((tag) => ({ id: tag.id }))
          },
        },
      });

      return project;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error instanceof Error ? error.message : 'Ошибка сервера',
      });
    }
  }
});
