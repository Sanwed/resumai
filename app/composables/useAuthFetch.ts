import type { UseFetchOptions } from '#app';

export function useAuthFetch<T = unknown>(url: string, options: UseFetchOptions<T> = {}) {
  const headers = useRequestHeaders(['cookie']);

  return useFetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...headers,
    },
  });
}
