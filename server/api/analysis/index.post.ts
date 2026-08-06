import z from 'zod';
import { inngest } from '~/lib/inngest/index';
import { fileUploaded } from '~/lib/inngest/event-types';

const bodySchema = z.object({
  fileIds: z.array(z.string()),
});

const querySchema = z.object({
  projectId: z.string(),
});

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query));

  if (!query.data || query.error) {
    throw createError({
      statusCode: 400,
      message: 'Project id is required',
    });
  }

  const body = await readValidatedBody(event, (body) => bodySchema.safeParse(body));

  if (body.error) {
    throw createError({
      statusCode: 400,
      message: 'Something went wrong',
    });
  }

  for (const id of body.data.fileIds) {
    await inngest.send(
      fileUploaded.create({
        projectId: query.data.projectId,
        fileId: id,
      }),
    );
  }
});
