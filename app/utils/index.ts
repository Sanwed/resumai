import { isAPIError } from 'better-auth/api';
import { authClient } from '~/lib/auth-client';

type Provider = 'github' | 'google' | 'linkedin';
export const signInWithProvider = async (provider: Provider, errorCallbackURL = '/login') => {
  await authClient.signIn.social({
    provider,
    callbackURL: '/dashboard',
    errorCallbackURL: errorCallbackURL,
  });
};

export function handleApiError(error: unknown, toast: ReturnType<typeof useToast>) {
  if (isAPIError(error)) {
    toast.add({
      title: error.name,
      description: error.message,
      icon: 'i-lucide-circle-x',
      color: 'error',
    });
  }
}
