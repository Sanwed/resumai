import { authClient } from '~/lib/auth-client';

const authRoutes = ['/login', '/signup'];

export default defineNuxtRouteMiddleware(async (to) => {
  const session = import.meta.server
    ? (await authClient.useSession(useAuthFetch)).data.value
    : (
        await authClient.getSession({
          fetchOptions: { cache: 'no-store' },
        })
      ).data;

  const isAuthRoute = authRoutes.some((route) => to.path.startsWith(route));

  if (isAuthRoute && session) {
    return navigateTo('/dashboard');
  }

  if (!session && !isAuthRoute) {
    return navigateTo('/login');
  }
});
