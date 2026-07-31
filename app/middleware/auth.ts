import { authClient } from '~/lib/auth-client';

const authRoutes = ['/login', '/signup'];

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useAuthFetch);

  const isAuthRoute = authRoutes.some((route) => to.path.startsWith(route));

  if (isAuthRoute && session.value) {
    return navigateTo('/dashboard');
  }

  if (!session.value && !isAuthRoute) {
    return navigateTo('/login');
  }
});
