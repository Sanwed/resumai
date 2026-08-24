// Keep permanent migration redirects active through at least 2027-08-24.
export const permanentRedirects: Readonly<Record<string, string>> = {
  '/privacy': '/privacy/introduction',
  '/terms': '/terms/acceptance-of-terms',
  '/cookies': '/cookies/introduction',
};
