import z from "zod";
import { MAX_TAG_NAME_LENGTH, MAX_USER_TAGS, TAG_VARIANT_NAMES } from "~/constants";
import { prisma } from "~/lib/auth";

const tagsQuerySchema = z.object({
  projectId: z.string(),
});

const tagCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Введите название")
    .max(MAX_TAG_NAME_LENGTH, "Превышено максимальное количество символов"),
  variant: z.enum(TAG_VARIANT_NAMES),
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
            userId: event.context.user?.id,
          },
          include: {
            tags: true,
          },
        });

        if (!project) {
          throw createError({
            statusCode: 400,
            statusMessage: "Проект не найден",
          });
        }

        return project.tags;
      }

      const tags = await prisma.tags.findMany({
        where: {
          userId: event.context.user?.id,
        }
      });
      return tags;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          error instanceof Error ? error.message : "Ошибка сервера",
      });
    }
  }
  if (event.method === "POST") {
    try {
      const body = await readValidatedBody(event, (body) =>
        tagCreateSchema.safeParse(body)
      );

      if (body.error) {
        throw createError({
          statusCode: 400,
          statusMessage: "Не заполнены обязательные поля",
        });
      }

      const existingTags = await prisma.tags.findMany({
        where: {
          userId: event.context.user?.id,
        }
      })

      if (existingTags.length > MAX_USER_TAGS) {
        throw createError({
          statusCode: 400,
          message: 'Превышен лимит созданных тегов',
        })
      }

      const tag = await prisma.tags.create({
        data: {
          ...body.data,
          userId: event.context.user?.id ?? '',
        },
      })

      return tag;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          error instanceof Error ? error.message : "Ошибка сервера",
      });
    }
  }
});
