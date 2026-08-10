import z from 'zod';

const bodySchema = z.object({
  notificationIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (!body.data || body.error) {
    throw createError({
      statusCode: 400,
      message: 'Incorrect body data',
    });
  }

  try {
    const updatedNotifications = await prisma.notification.updateManyAndReturn({
      where: {
        id: { in: body.data.notificationIds },
        userId: event.context.user.id,
      },
      data: {
        read: true,
      },
    });

    return updatedNotifications;
  } catch (error) {
    console.error('[PATCH /api/notification]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update notifications',
    });
  }
});
