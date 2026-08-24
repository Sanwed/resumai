import { del, put } from '@vercel/blob';
import { AllowedFileFormats, MAX_RESUME_FILE_SIZE, MAX_RESUME_FILES_PER_UPLOAD } from '~/constants';
import { fileQuerySchema } from '#server/types/schema';

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => fileQuerySchema.safeParse(query));

  if (query.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: query.data.projectId,
      userId: event.context.user.id,
    },
    select: { id: true },
  });

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  const files = await readMultipartFormData(event);

  if (!files?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files provided' });
  }

  if (files.length > MAX_RESUME_FILES_PER_UPLOAD) {
    throw createError({ statusCode: 400, statusMessage: 'Too many files uploaded simultaneously' });
  }

  for (const file of files) {
    if (file.data.length > MAX_RESUME_FILE_SIZE) {
      throw createError({ statusCode: 400, statusMessage: 'File too large' });
    }

    if (!file.type || !Object.values<string>(AllowedFileFormats).includes(file.type)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid file type' });
    }
  }

  const uploaded = [];

  try {
    for (const file of files) {
      const filename = sanitizeFilename(file.filename ?? '');
      const { url } = await put(`resume/${event.context.user.id}-${filename}`, file.data, {
        access: 'private',
        addRandomSuffix: true,
        contentType: file.type,
      });

      uploaded.push({
        url,
        filename: filename,
        size: file.data.length,
        type: file.type ?? '',
      });
    }
  } catch (error) {
    console.error('[POST] /api/file', error);

    await Promise.allSettled(uploaded.map((file) => del(file.url)));

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload one or more files',
    });
  }

  try {
    const createdFiles = await prisma.projectFile.createManyAndReturn({
      data: uploaded.map((file) => ({
        ...file,
        userId: event.context.user.id,
        projectId: query.data.projectId,
      })),
    });

    return createdFiles;
  } catch (error) {
    console.error('[POST] /api/file]', error);

    await Promise.allSettled(uploaded.map((file) => del(file.url)));

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload one or more files',
    });
  }
});
