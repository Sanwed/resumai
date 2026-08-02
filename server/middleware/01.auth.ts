import { auth } from '~/lib/auth';

const protectedPrefixes: string[] = ['/api/project', '/api/upload'];

export default defineEventHandler(async (event) => {
  const isProtected = protectedPrefixes.some((prefix) => event.path.startsWith(prefix));

  if (!isProtected) return;

  const session = await auth.api.getSession({ headers: event.headers });

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  event.context.user = session.user;
});
