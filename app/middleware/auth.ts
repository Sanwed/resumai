import { authClient } from '~/lib/auth-client';

const authRoutes = ['/login', '/signup'];

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useAuthFetch);

  const isAuthRoute = authRoutes.some((route) => to.path.startsWith(route));
  const hasVerifiedSession = Boolean(session.value?.user.emailVerified);

  if (isAuthRoute && hasVerifiedSession) {
    return navigateTo('/dashboard');
  }

  if (!hasVerifiedSession && !isAuthRoute) {
    return navigateTo('/login');
  }
});
