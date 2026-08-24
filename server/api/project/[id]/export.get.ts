import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import PDFDocument from 'pdfkit';
import type { Analysis, Project } from '~/generated/prisma/client';

type ProjectWithAnalyses = Project & { analyses: Analysis[] };

const FONT_REGULAR_PATH = join(process.cwd(), 'server/assets/fonts/NotoSans-Regular.ttf');
const FONT_BOLD_PATH = join(process.cwd(), 'server/assets/fonts/NotoSans-Bold.ttf');

export function generateProjectReportPdf(project: ProjectWithAnalyses) {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });

  doc.registerFont('NotoSans Regular', readFileSync(FONT_REGULAR_PATH));
  doc.registerFont('NotoSans Bold', readFileSync(FONT_BOLD_PATH));

  doc.font('NotoSans Regular');

  doc.fontSize(20).font('NotoSans Bold').text(`Hiring Report — ${project.name}`);
  doc.moveDown();

  if (project.vacancyText) {
    doc.fontSize(12).font('NotoSans Bold').fillColor('#555').text('Vacancy');
    doc.fontSize(10).font('NotoSans Regular').fillColor('#000').text(project.vacancyText);
  }

  for (const analysis of project.analyses) {
    doc.addPage();
    doc
      .fontSize(16)
      .font('NotoSans Bold')
      .fillColor('#000')
      .text(analysis.candidateName ?? 'Not specified');
    doc
      .fontSize(11)
      .font('NotoSans Regular')
      .fillColor('#555')
      .text(`Compatibility: ${analysis.compatibility}% — ${analysis.verdict}`);
    doc.fillColor('#000').moveDown(0.5);

    if (analysis.relevantExperienceYears != null) {
      doc.fontSize(10).font('NotoSans Regular').text(`Relevant experience: ${analysis.relevantExperienceYears} years`);
    }
    if (analysis.email || analysis.phone || analysis.linkedin || analysis.github) {
      doc
        .fontSize(10)
        .font('NotoSans Regular')
        .text([analysis.email, analysis.phone, analysis.linkedin, analysis.github].filter(Boolean).join('  •  '));
    }
    doc.moveDown(0.5);

    addList(doc, 'Strengths', analysis.strengths);
    addList(doc, 'Gaps', analysis.gaps);
    addList(doc, 'Red Flags', analysis.redFlags);
    addInlineList(doc, 'Skills', analysis.skills);
    addList(doc, 'Suggested Interview Questions', analysis.interviewQuestions);
  }

  doc.end();
  return doc;
}

function addList(doc: PDFKit.PDFDocument, title: string, items?: string[] | null) {
  if (!items?.length) return;
  doc.fontSize(12).font('NotoSans Bold').text(title, { underline: true });
  doc.font('NotoSans Regular');
  items.forEach((item) => doc.fontSize(10).text(`•  ${item}`));
  doc.moveDown(0.5);
}

function addInlineList(doc: PDFKit.PDFDocument, title: string, items?: string[] | null) {
  if (!items?.length) return;
  doc.fontSize(12).font('NotoSans Bold').text(title, { underline: true });
  doc.fontSize(10).font('NotoSans Regular').text(items.join('  •  '));
  doc.moveDown(0.5);
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project id is required' });
  }

  const project = await prisma.project.findUnique({
    where: { id, userId: event.context.user.id },
    include: { analyses: true },
  });

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
  }

  if (!project.analyses.length) {
    throw createError({ statusCode: 400, statusMessage: 'No analyses to export' });
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${project.name}-report.pdf"`,
    'X-Robots-Tag': 'noindex, nofollow',
  });

  const doc = generateProjectReportPdf(project);
  return sendStream(event, doc);
});
