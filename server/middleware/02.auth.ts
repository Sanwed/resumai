import { auth } from '~/lib/auth';

const protectedPrefixes: string[] = [
  '/api/project',
  '/api/avatar',
  '/api/file',
  '/api/analysis',
  '/api/realtime',
  '/api/notification',
];

export default defineEventHandler(async (event) => {
  const isProtected = protectedPrefixes.some((prefix) => event.path.startsWith(prefix));

  if (!isProtected) return;

  const session = await auth.api.getSession({ headers: event.headers });

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  if (!session.user.emailVerified) {
    throw createError({ statusCode: 403, statusMessage: 'Email verification required' });
  }

  event.context.user = session.user;
});
