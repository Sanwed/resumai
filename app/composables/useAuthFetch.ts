import type { UseFetchOptions } from '#app';

export function useAuthFetch<T = unknown>(url: string, options: UseFetchOptions<T> = {}) {
  return useFetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...useRequestHeaders(['cookie']),
    },
  });
}
