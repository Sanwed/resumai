import { get } from '@vercel/blob';

export default defineEventHandler(async (event) => {
  const image = event.context.user.image;

  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' });
  }

  const result = await get(image, {
    access: 'private',
    ifNoneMatch: getHeader(event, 'if-none-match'),
  });

  if (!result) {
    throw createError({ statusCode: 404 });
  }

  setHeader(event, 'ETag', result.blob.etag);
  setHeader(event, 'Cache-Control', 'private, no-cache');
  setHeader(event, 'X-Content-Type-Options', 'nosniff');

  if (result.statusCode === 304) {
    setResponseStatus(event, 304);
    return null;
  }

  setHeader(event, 'Content-Type', result.blob.contentType ?? 'application/octet-stream');

  return sendStream(event, result.stream);
});
