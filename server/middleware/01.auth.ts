import { auth } from "~/lib/auth";
import type { User } from "~/generated/prisma";

export default defineEventHandler(async (event) => {
  const isAuthRoute = event.path.startsWith('/api/auth/');

  if (!event.path.startsWith('/api/') || isAuthRoute) {
    return;
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Необходимо зарегистрироваться',
    })
  };

  event.context.user = session.user as User;
})