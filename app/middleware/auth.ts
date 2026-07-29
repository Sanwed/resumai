import { authClient } from '~/lib/auth-client';

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useAuthFetch);
  if (!session.value) {
    return navigateTo({ path: '/login/' });
  }
});
