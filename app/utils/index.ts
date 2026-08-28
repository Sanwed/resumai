import { isAPIError } from 'better-auth/api';
import { authClient } from '~/lib/auth-client';

type Provider = 'github' | 'google' | 'linkedin';
export async function signInWithProvider(provider: Provider, errorCallbackURL = '/login') {
  const { error } = await authClient.signIn.social({
    provider,
    callbackURL: '/dashboard',
    errorCallbackURL: errorCallbackURL,
  });

  if (error) throw error;
}

export function handleApiError(error: unknown, toast: ReturnType<typeof useToast>) {
  if (typeof error !== 'object' || error === null) return;

  const authError = error as Record<string, unknown>;
  const description =
    typeof authError.message === 'string'
      ? authError.message
      : typeof authError.statusText === 'string'
        ? authError.statusText
        : undefined;

  if (!description) return;

  console.error(error);
  toast.add({
    title: isAPIError(error) ? error.name : typeof authError.code === 'string' ? authError.code : undefined,
    description,
    icon: 'i-lucide-circle-x',
    color: 'error',
  });
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
