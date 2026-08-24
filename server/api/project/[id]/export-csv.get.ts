import type { Analysis, Project } from '~/generated/prisma/client';

type ProjectWithAnalyses = Project & { analyses: Analysis[] };

export function generateProjectReportCsv(project: ProjectWithAnalyses): string {
  const headers = [
    'Candidate',
    'Compatibility %',
    'Verdict',
    'Experience (years)',
    'Email',
    'Phone',
    'LinkedIn',
    'GitHub',
    'Strengths',
    'Gaps',
    'Red Flags',
    'Skills',
  ];

  const rows = project.analyses.map((a) => [
    a.candidateName ?? '',
    String(a.compatibility),
    a.verdict,
    a.relevantExperienceYears != null ? String(a.relevantExperienceYears) : '',
    a.email ?? '',
    a.phone ?? '',
    a.linkedin ?? '',
    a.github ?? '',
    (a.strengths ?? []).join('; '),
    (a.gaps ?? []).join('; '),
    (a.redFlags ?? []).join('; '),
    (a.skills ?? []).join('; '),
  ]);

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const lines = [headers, ...rows].map((row) => row.map((e) => escape(e ?? '')).join(','));

  return '\uFEFF' + lines.join('\r\n');
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project id is required',
    });
  }

  const project = await prisma.project.findFirst({
    where: { id, userId: event.context.user.id },
    include: { analyses: true },
  });

  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' });

  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${project.name}-report.csv"`,
    'X-Robots-Tag': 'noindex, nofollow',
  });

  return generateProjectReportCsv(project);
});
