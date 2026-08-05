import { del, put } from '@vercel/blob';
import { AvailableFileFormats, MAX_RESUME_FILE_SIZE } from '~/constants';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'id');

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  const files = await readMultipartFormData(event);

  if (!files?.length) {
    throw createError({ statusCode: 400, message: 'No files provided' });
  }

  for (const file of files) {
    if (file.data.length > MAX_RESUME_FILE_SIZE) {
      throw createError({ statusCode: 400, message: 'File too large' });
    }

    if (!file.type || !Object.values<string>(AvailableFileFormats).includes(file.type)) {
      throw createError({ statusCode: 400, message: 'Invalid file type' });
    }
  }

  const uploaded = [];

  try {
    for (const file of files) {
      const { url } = await put(`resume/${event.context.user.id}-${file.filename}`, file.data, {
        access: 'public',
        addRandomSuffix: true,
        contentType: file.type,
      });

      uploaded.push({
        url,
        filename: file.filename ?? '',
        size: file.data.length,
        type: file.type ?? '',
      });
    }
  } catch (error) {
    console.error('[POST] /api/file/:id]', error);

    await Promise.allSettled(uploaded.map((file) => del(file.url)));

    throw createError({
      statusCode: 500,
      message: 'Failed to upload one or more files',
    });
  }

  try {
    const createdFiles = await prisma.projectFile.createManyAndReturn({
      data: uploaded.map((file) => ({
        ...file,
        projectId: projectId,
      })),
    });

    return createdFiles;
  } catch (error) {
    console.error('[POST] /api/file/:id]', error);

    await Promise.allSettled(uploaded.map((file) => del(file.url)));

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload one or more files',
    });
  }
});
