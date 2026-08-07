import type { AnalysisStatus, ProjectFile } from '~/generated/prisma/client';
import { inngest } from './client';
import { fileUploaded } from './event-types';
import { NonRetriableError, type StepError } from 'inngest';
import { analysisChannel } from './channels';
import { getDocumentProxy, extractText } from 'unpdf';

export const analyzeResume = inngest.createFunction(
  { id: 'analyze-resume', name: 'Analyze Resume', triggers: [fileUploaded] },
  async ({ event, step }) => {
    const ch = analysisChannel({ projectId: event.data.projectId });

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
        progress: 100,
      });

      throw err;
    }

    let status: AnalysisStatus = 'parsing';
    let statusMessage = 'Extracting text from file';
    let progress = 20;

    const newAnalysis = await step.run(
      'create-analysis',
      async () =>
        await prisma.analysis.create({
          data: {
            projectId: event.data.projectId,
            fileId: event.data.fileId,
            status,
            statusMessage,
            progress,
          },
        }),
    );

    await step.realtime.publish('file-parsing', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
      newAnalysis,
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

      await step.run('update-status-parse-failed', async () => {
        await prisma.analysis.update({
          where: { fileId: event.data.fileId, projectId: event.data.projectId },
          data: { status: 'failed', statusMessage: 'Error while parsing file to text', progress: 100 },
        });
      });

      await step.realtime.publish('text-parse-error', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Error while parsing file to text',
        progress: 100,
      });

      throw err;
    }

    status = 'analyzing';
    statusMessage = 'Analyzing file using AI';
    progress = 40;

    await step.run('update-status-analyzing', async () => {
      await prisma.analysis.update({
        where: { projectId: event.data.projectId, fileId: event.data.fileId },
        data: { status, statusMessage, progress },
      });
    });

    await step.realtime.publish('file-analyzing', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
    });
  },
);
