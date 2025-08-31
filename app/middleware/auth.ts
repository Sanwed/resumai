import { authClient } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  const headers = useRequestHeaders();

  const { data } = await authClient.getSession({
    fetchOptions: {
      headers,
    },
  });

  if (!data?.session) {
    if (!to.path.includes("/auth")) {
      return navigateTo("/auth/login");
    }
  } else {
    if (to.path.includes("/auth")) {
      return navigateTo("/");
    }
  }
});
