import { createAuthClient } from 'better-auth/vue';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '~/lib/auth';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  baseURL: process.env.BETTER_AUTH_URL,
});
