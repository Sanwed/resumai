import z from "zod";
import { auth, prisma } from "~/lib/auth";

const projectFilesUpdateSchema = z.object({});

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session) {
      throw new Error("Необходимо авторизоваться");
    }

    const body = await readValidatedBody(event, (body) =>
      projectFilesUpdateSchema.safeParse(body)
    );

    if (body.error) {
      throw new Error("Не заполнены обязательные поля");
    }

    const project = await prisma.projects.create({
      data: {
        ...body.data,
        userId: session.user.id,
        tags: {
          connect:
            body.data.tags?.length > 0
              ? body.data.tags.map((tag) => ({ id: tag.id }))
              : undefined,
        },
      },
    });

    return project;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Ошибка сервера",
    });
  }
});
