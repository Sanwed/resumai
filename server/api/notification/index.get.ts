import z from 'zod';

const querySchema = z.object({
  read: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: query.error.message,
    });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: event.context.user.id,
        read: query.data.read,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  } catch (error) {
    console.error('[GET] /api/notification', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch notifications',
    });
  }
});
