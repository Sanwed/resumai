import z from "zod";
import { prisma } from "~/lib/auth";
import {MAX_USER_PROJECTS, TAG_VARIANT_NAMES} from '@/constants';

const projectQuerySchema = z.object({
  projectId: z.string().nullish(),
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
      variant: z.enum(TAG_VARIANT_NAMES),
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
        throw createError({
          statusCode: 400,
          statusMessage: 'Не заполнено поле: projectId',
        })
      }

      const projects = await prisma.projects.findMany({
        where: {
          userId: event.context.user?.id,
          id: query.data.projectId || undefined,
        },
      });

      return projects;
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
        projectCreateSchema.safeParse(body)
      );

      if (body.error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Не заполнены обязательные поля',
        })
      }

      const existingPropjects = await prisma.projects.findMany({
        where: {
          userId: event.context.user?.id,
        },
      });

      if (existingPropjects.length >= MAX_USER_PROJECTS) {
        throw createError({
          statusCode: 400,
          message: 'Превышен лимит созданных проектов',
        })
      }

      const project = await prisma.projects.create({
        data: {
          ...body.data,
          userId: event.context.user?.id ?? '',
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
        statusMessage:
          error instanceof Error ? error.message : "Ошибка сервера",
      });
    }
  }
});
