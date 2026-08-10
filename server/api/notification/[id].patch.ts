export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Notification id is required',
    });
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: {
        id,
        userId: event.context.user.id,
      },
      data: {
        read: true,
      },
    });

    return updatedNotification;
  } catch (error) {
    console.error('[PATCH /api/notification/:id]', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update notification',
    });
  }
});
