import { permanentRedirects } from '../../shared/permanent-redirects';

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  if (
    !['GET', 'HEAD'].includes(event.method) ||
    url.pathname === '/' ||
    !url.pathname.endsWith('/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_nuxt/')
  ) {
    return;
  }

  const path = url.pathname.replace(/\/+$/, '') || '/';
  const destination = permanentRedirects[path] || path;

  sendRedirect(event, `${destination}${url.search}`, 301);
});
