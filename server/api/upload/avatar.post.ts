import { put } from '@vercel/blob';
import { MAX_AVATAR_FILE_SIZE } from '~/constants';

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  const file = files?.[0];

  if (!file) {
    throw createError({ statusCode: 400, message: 'No file provided' });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, message: 'Invalid file type' });
  }

  if (file.data.length > MAX_AVATAR_FILE_SIZE) {
    throw createError({ statusCode: 400, message: 'File too large' });
  }

  const { url } = await put(`avatar/${event.context.user.id}-${file.filename}`, file.data, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });

  return { url };
});
