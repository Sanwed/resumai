import { isAPIError } from 'better-auth/api';
import { authClient } from '~/lib/auth-client';

type Provider = 'github' | 'google' | 'linkedin';
export async function signInWithProvider(provider: Provider, errorCallbackURL = '/login') {
  await authClient.signIn.social({
    provider,
    callbackURL: '/dashboard',
    errorCallbackURL: errorCallbackURL,
  });
}

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

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function parseExperienceDuration(value: number): string {
  let years = Math.trunc(value);

  const decimalPart = value.toFixed(2).split('.')[1]?.replace(/0+$/, '');

  let months = decimalPart ? Number(decimalPart) : 0;

  if (months >= 12) {
    years += Math.floor(months / 12);
    months = months % 12;
  }

  return `${years} y, ${months} mon`;
}
