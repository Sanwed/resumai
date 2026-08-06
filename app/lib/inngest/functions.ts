import type { ProjectFile } from '~/generated/prisma/client';
import { inngest } from './client';
import { fileUploaded } from './event-types';
import { NonRetriableError, type StepError } from 'inngest';
import { analysisChannel } from './channels';
import { getDocumentProxy, extractText } from 'unpdf';

export const analyzeResume = inngest.createFunction(
  { id: 'analyze-resume', name: 'Analyze Resume', triggers: [fileUploaded] },
  async ({ event, step }) => {
    const ch = analysisChannel({ projectId: event.data.projectId });

    await step.realtime.publish('file-fetching', ch.status, {
      fileId: event.data.fileId,
      status: 'fetching',
      statusMessage: 'Fetching file',
    });

    let existingFile: ProjectFile | undefined;
    try {
      existingFile = await step.run('fetch-file-by-id', async () => {
        const file = await prisma.projectFile.findUnique({
          where: { id: event.data.fileId, projectId: event.data.projectId },
        });

        if (!file) {
          throw new NonRetriableError('File not found');
        }

        return file;
      });
    } catch (e) {
      const err = e as StepError;

      console.error(err);
      await step.realtime.publish('file-not-found', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'File not found',
      });

      throw err;
    }

    await step.realtime.publish('file-parsing', ch.status, {
      fileId: event.data.fileId,
      status: 'parsing',
      statusMessage: 'Parsing file',
    });

    let parsedText: string | undefined;
    try {
      parsedText = await step.run('parse-file-to-text', async () => {
        const buffer = await $fetch<ArrayBuffer>(existingFile.url, { responseType: 'arrayBuffer' });
        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const { text } = await extractText(pdf, { mergePages: true });

        if (!text.trim()) {
          throw new Error('Error while parsing file to text');
        }

        return text;
      });
    } catch (e) {
      const err = e as StepError;

      console.error(err);
      await step.realtime.publish('text-parse-error', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Error while parsing file to text',
      });

      throw err;
    }

    await step.realtime.publish('file-pars', ch.status, {
      fileId: event.data.fileId,
      status: 'analyzing',
      statusMessage: 'Analyzing',
    });
  },
);
