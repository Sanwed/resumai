import type { Analysis, AnalysisStatus, Notification, ProjectFile } from '~/generated/prisma/client';
import { inngest } from './client';
import { analysisFinished, fileUploaded } from './event-types';
import { NonRetriableError, type StepError } from 'inngest';
import { analysisChannel } from './channels';
import { getDocumentProxy, extractText } from 'unpdf';
import type z from 'zod';
import { generateText, Output } from 'ai';
import { analysisAIResponseSchema } from '#server/types/schema';
import { anthropic } from '@ai-sdk/anthropic';
import { MINIMAL_ANALYSIS_COST, TOKEN_COEFFICIENT } from '~/constants';

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

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: `File with id ${event.data.fileId} was not found`,
        }),
      );

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

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: `Could not create an analysis`,
        }),
      );

      throw err;
    }

    await step.realtime.publish('data-fetching', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
      newAnalysis,
    });

    let existingProject:
      | {
          vacancyText: string | null;
          name: string;
        }
      | undefined;
    try {
      existingProject = await step.run('fetch-project-by-id', async () => {
        const response = await prisma.project.findUnique({
          where: { id: event.data.projectId, userId: event.data.userId },
          select: {
            vacancyText: true,
            name: true,
          },
        });

        if (!response) {
          throw new NonRetriableError('Project not found');
        }

        return response;
      });
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

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: `Project not found. Maybe it was deleted or incorrect data was sent`,
        }),
      );

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

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: `Impossible to parse file to text`,
        }),
      );

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

    try {
      await step.run('check-balance', async () => {
        const userBalance = await prisma.user.findUnique({
          where: {
            id: event.data.userId,
          },
          select: {
            tokens: true,
          },
        });

        if ((userBalance?.tokens ?? 0) < MINIMAL_ANALYSIS_COST) {
          throw new NonRetriableError('Insufficient tokens for analysis');
        }
      });
    } catch (e) {
      const err = e as StepError;
      console.error(err);

      await step.run('update-status-balance-failed', async () => {
        await prisma.analysis.update({
          where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
          data: { status: 'failed', statusMessage: 'Insufficient tokens for analysis', progress: 100 },
        });
      });

      await step.realtime.publish('analysis-error', ch.status, {
        fileId: event.data.fileId,
        status: 'failed',
        statusMessage: 'Insufficient tokens for analysis',
        progress: 100,
      });

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: 'Insufficient tokens for analysis',
        }),
      );

      throw err;
    }

    let res: { analysis: Analysis | undefined; usage: number } | undefined;
    try {
      const { analysis, usage } = await step.run('generate-ai-response', async () => {
        const result = await generateText({
          model: anthropic('claude-haiku-4-5-20251001'),
          prompt: buildAnalysisPrompt(existingProject?.vacancyText ?? '', parsedText),
          output: Output.object({
            schema: analysisAIResponseSchema,
          }),
        });

        const totalTokens = (result.usage.totalTokens ?? 0) / TOKEN_COEFFICIENT;

        const res = await prisma.user.updateMany({
          where: {
            id: event.data.userId,
            tokens: { gte: totalTokens },
          },
          data: {
            tokens: {
              decrement: totalTokens,
            },
          },
        });

        if (res.count === 0) {
          throw new NonRetriableError('Insufficient tokens for analysis');
        }

        const finalObject: z.infer<typeof analysisSchema> = {
          ...newAnalysis,
          ...result.output,
          status: 'succeed',
          statusMessage: '',
          progress: 100,
          vacancyHash: existingProject?.vacancyText ?? '',
        };

        return { analysis: finalObject, usage: totalTokens };
      });

      res = {
        analysis: analysis
          ? {
              ...analysis,
              createdAt: new Date(analysis.createdAt),
              updatedAt: new Date(analysis.updatedAt),
            }
          : undefined,
        usage,
      };
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

      await step.sendEvent(
        'send-analysis-failed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: 'Analysis error',
          message: `Error while analyzing with AI`,
        }),
      );

      throw err;
    }

    status = 'succeed';
    statusMessage = '';
    progress = 100;

    await step.run('update-status-analysis-complete', async () => {
      await prisma.analysis.update({
        where: { fileId: event.data.fileId, projectId: event.data.projectId, userId: event.data.userId },
        data: { ...res.analysis },
      });
    });

    await step.realtime.publish('file-completed', ch.status, {
      fileId: event.data.fileId,
      status,
      statusMessage,
      progress,
      newAnalysis: res.analysis,
    });

    const isProjectComplete = await step.run('check-project-completion', async () => {
      const [totalFiles, terminalAnalyses] = await Promise.all([
        prisma.projectFile.count({
          where: { projectId: event.data.projectId, userId: event.data.userId },
        }),
        prisma.analysis.count({
          where: {
            projectId: event.data.projectId,
            userId: event.data.userId,
            status: { in: ['succeed', 'failed'] },
          },
        }),
      ]);

      return totalFiles > 0 && totalFiles === terminalAnalyses;
    });

    if (isProjectComplete) {
      await step.sendEvent(
        'send-analysis-succeed-event',
        analysisFinished.create({
          projectId: event.data.projectId,
          userId: event.data.userId,
          title: `Analysis completed`,
          message: `Successful analysis for project "${existingProject.name}". Click on the notification to see results`,
          link: `/dashboard/${event.data.projectId}`,
        }),
      );
    }
  },
);

export const sendNotification = inngest.createFunction(
  {
    id: 'send-notification',
    name: 'Send Notification',
    triggers: [analysisFinished],
  },
  async ({ event, step }) => {
    const ch = analysisChannel({ projectId: event.data.projectId });

    let newNotification: Notification | undefined;
    try {
      const notification = await step.run('create-notification', async () => {
        const response = await prisma.notification.create({
          data: {
            userId: event.data.userId,
            title: event.data.title,
            message: event.data.message,
            link: event.data.link,
          },
        });

        return response;
      });

      newNotification = {
        ...notification,
        createdAt: new Date(notification.createdAt),
      };
    } catch (e) {
      const err = e as StepError;

      console.error(err);

      throw err;
    }

    await step.realtime.publish('notification-created', ch.notification, {
      notification: newNotification,
    });
  },
);
