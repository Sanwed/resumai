import { put } from '@vercel/blob';
import { AllowedAvatarFormats, MAX_AVATAR_FILE_SIZE } from '~/constants';
import { sanitizeFilename } from '#server/utils/files';

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  const file = files?.[0];

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' });
  }

  if (!file.type || !Object.values<string>(AllowedAvatarFormats).includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type' });
  }

  if (file.data.length > MAX_AVATAR_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'File too large' });
  }

  try {
    const filename = sanitizeFilename(file.filename ?? '');
    const { url } = await put(`avatar/${event.context.user.id}-${filename}`, file.data, {
      access: 'private',
      addRandomSuffix: true,
      contentType: file.type,
    });

    return url;
  } catch (error) {
    console.error('[POST] /api/upload/avatar', error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload avatar',
    });
  }
});
