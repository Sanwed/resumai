import type { Analysis, AnalysisStatus, Project, ProjectFile } from '~/generated/prisma/client';
import { inngest } from './client';
import { fileUploaded } from './event-types';
import { NonRetriableError, type StepError } from 'inngest';
import { analysisChannel } from './channels';
import { getDocumentProxy, extractText } from 'unpdf';
import type z from 'zod';
import { generateText, Output } from 'ai';
import { analysisAIResponseSchema, type analysisSchema } from '~/types/schema';
import { anthropic } from '@ai-sdk/anthropic';

export const analyzeResume = inngest.createFunction(
  {
    id: 'analyze-resume',
    name: 'Analyze Resume',
    triggers: [fileUploaded],
    cancelOn: [
      {
        event: 'app/file.deleted',
        if: 'async.data.fileId == event.data.fileId',
      },
    ],
  },
  async ({ event, step }) => {
    const ch = analysisChannel({ projectId: event.data.projectId });

    let existingFile: ProjectFile | undefined;
    try {
      existingFile = await step.run('fetch-file-by-id', async () => {
        const file = await prisma.projectFile.findUnique({
          where: { id: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
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

    let status: AnalysisStatus = 'fetching';
    let statusMessage = 'Fetching necessary data';
    let progress = 20;

    let newAnalysis: Analysis | undefined;
    try {
      const response = await step.run('create-analysis', async () => {
        const existingAnalysis = await prisma.analysis.findUnique({
          where: { userId: event.data.userId, projectId: event.data.projectId, fileId: event.data.fileId },
        });

        if (!existingAnalysis) {
          return await prisma.analysis.create({
            data: {
              userId: event.data.userId,
              projectId: event.data.projectId,
              fileId: event.data.fileId,
              status,
              statusMessage,
              progress,
            },
          });
        }

        return existingAnalysis;
      });

      newAnalysis = {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (e) {
      const err = e as StepError;

      console.error(err);
      await step.realtime.publish('analysis-not-created', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Error while creating an analysis',
        progress: 100,
      });

      throw err;
    }

    await step.realtime.publish('data-fetching', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
      newAnalysis,
    });

    let existingProject: Project | undefined;
    try {
      const project = await step.run('fetch-project-by-id', async () => {
        const response = await prisma.project.findUnique({
          where: { id: event.data.projectId, userId: event.data.userId },
        });

        if (!response) {
          throw new NonRetriableError('Project not found');
        }

        return response;
      });

      existingProject = project
        ? {
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          }
        : undefined;
    } catch (e) {
      const err = e as StepError;
      console.error(err);

      await step.run('update-status-fetching-failed', async () => {
        await prisma.analysis.update({
          where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
          data: { status: 'failed', statusMessage: 'Project not found', progress: 100 },
        });
      });

      await step.realtime.publish('project-not-found', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Project not found',
        progress: 100,
      });

      throw err;
    }

    status = 'parsing';
    statusMessage = 'Extracting data from file';
    progress = 40;

    await step.run('update-status-parsing', async () => {
      await prisma.analysis.update({
        where: { projectId: event.data.projectId, fileId: event.data.fileId, userId: event.data.userId },
        data: { status, statusMessage, progress },
      });
    });

    await step.realtime.publish('file-parsing', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
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
          where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
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
    progress = 70;

    await step.run('update-status-analyzing', async () => {
      await prisma.analysis.update({
        where: { projectId: event.data.projectId, fileId: event.data.fileId, userId: event.data.userId },
        data: { status, statusMessage, progress },
      });
    });

    await step.realtime.publish('file-analyzing', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
    });

    let res: Analysis | undefined;
    try {
      const analysis = await step.run('generate-ai-response', async () => {
        const result = await generateText({
          model: anthropic('claude-haiku-4-5-20251001'),
          prompt: buildAnalysisPrompt(existingProject?.vacancyText ?? '', parsedText),
          output: Output.object({
            schema: analysisAIResponseSchema,
          }),
        });

        const finalObject: z.infer<typeof analysisSchema> = {
          ...newAnalysis,
          ...result.output,
          status: 'succeed',
          statusMessage: '',
          progress: 100,
          vacancyHash: existingProject?.vacancyText ?? '',
        };

        return finalObject;
      });

      res = analysis
        ? {
            ...analysis,
            createdAt: new Date(analysis.createdAt),
            updatedAt: new Date(analysis.updatedAt),
          }
        : undefined;
    } catch (e) {
      const err = e as StepError;
      console.error(err);

      await step.run('update-status-analysis-failed', async () => {
        await prisma.analysis.update({
          where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
          data: { status: 'failed', statusMessage: 'Error while analyzing file', progress: 100 },
        });
      });

      await step.realtime.publish('analysis-error', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Error during analyzing with AI',
        progress: 100,
      });

      throw err;
    }

    status = 'succeed';
    statusMessage = '';
    progress = 100;

    await step.run('update-status-analysis-complete', async () => {
      await prisma.analysis.update({
        where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
        data: { ...res },
      });
    });

    await step.realtime.publish('file-completed', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
      newAnalysis: res,
    });
  },
);
