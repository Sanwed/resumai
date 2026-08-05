<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import type { Analysis } from '~/generated/prisma/client';

  const analysis: Analysis = {
    id: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    fileId: crypto.randomUUID(),
    candidateName: 'Александр Козюков',
    compatibility: 87,
    verdict: 'Отличный кандидат на данную вакансию — опыт и стек полностью закрывают требования.',
    strengths: [
      'Глубокие знания Vue и Nuxt',
      'Большой опыт коммерческой разработки',
      'Работа в известных продуктовых компаниях',
    ],
    gaps: ['Не работал с legacy-кодом', 'Нет опыта с микросервисами'],
    skills: ['Vue', 'Nuxt', 'TypeScript', 'Tailwind CSS', 'Pinia', 'REST API', 'Prisma'],
    relevantExperienceYears: 2.6,
    redFlags: ['Частая смена мест работы за последний год'],
    interviewQuestions: [
      'Расскажите про самый сложный проект на Vue, над которым вы работали',
      'Как вы подходите к оптимизации производительности SPA?',
    ],
    phone: '+7 999 123-45-67',
    email: 'alex.kozyukov@example.com',
    linkedin: 'https://linkedin.com/in/example',
    github: 'https://github.com/example',
    vacancyHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  type CompatibilityColor = 'success' | 'warning' | 'error';

  type CompatibilityMeta = {
    color: CompatibilityColor;
    label: string;
  };

  const compatibilityMap: { threshold: number; meta: CompatibilityMeta }[] = [
    { threshold: 75, meta: { color: 'success', label: 'High correspondence' } },
    { threshold: 50, meta: { color: 'warning', label: 'Medium correspondence' } },
    { threshold: 0, meta: { color: 'error', label: 'Low correspondence' } },
  ];

  const compatibilityMeta = computed<CompatibilityMeta>(
    () =>
      compatibilityMap.find((entry) => analysis.compatibility >= entry.threshold)?.meta ??
      compatibilityMap.at(-1)!.meta,
  );

  const contactItems: ComputedRef<NavigationMenuItem[]> = computed(() => {
    const items = [
      {
        'aria-label': 'Contact phone',
        icon: 'i-lucide-phone',
        to: `tel:${analysis.phone}`,
        disabled: !analysis.phone,
      },
      {
        'aria-label': 'Email',
        icon: 'i-lucide-mail',
        to: `mailto:${analysis.email}`,
        disabled: !analysis.email,
      },
      {
        'aria-label': 'LinkedIn',
        icon: 'i-simple-icons-linkedin',
        to: `${analysis.linkedin}`,
        disabled: !analysis.linkedin,
      },
      {
        'aria-label': 'GitHub',
        icon: 'i-simple-icons-github',
        to: `${analysis.github}`,
        disabled: !analysis.github,
      },
    ];

    return items.filter((item) => !item.disabled);
  });
</script>

<template>
  <UCard :ui="{ header: 'sm:py-2 sm:px-4', body: 'sm:p-4', footer: 'bg-muted' }">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <UAvatar :alt="analysis.candidateName ?? 'Candidate'" icon="i-lucide-user-round" class="shrink-0" />
          <div>
            <p class="font-medium text-base truncate">{{ analysis.candidateName ?? 'Кандидат' }}</p>
            <p class="text-xs text-muted">
              Relevant experience:
              {{ analysis.relevantExperienceYears ? parseExperienceDuration(analysis.relevantExperienceYears) : '—' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UNavigationMenu :items="contactItems" :ui="{ link: 'p-1', linkLeadingIcon: 'size-4' }" />
          <UBadge :color="compatibilityMeta.color" variant="subtle" class="shrink-0">
            {{ analysis.compatibility }}%
          </UBadge>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div>
        <UProgress :model-value="analysis.compatibility" :color="compatibilityMeta.color" size="sm" />
        <p class="text-xs text-muted mt-1">{{ compatibilityMeta.label }}</p>
      </div>

      <p class="text-sm text-highlighted line-clamp-3">{{ analysis.verdict }}</p>

      <div v-if="analysis.strengths.length || analysis.gaps.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div v-if="analysis.strengths.length" class="flex flex-col gap-1.5">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">Strengths</p>
          <ul class="flex flex-col gap-1">
            <li v-for="(strength, index) in analysis.strengths" :key="index" class="flex items-start gap-1.5 text-sm">
              <UIcon name="i-lucide-check" class="text-success shrink-0 mt-0.5" size="16" />
              <span class="text-toned">{{ strength }}</span>
            </li>
          </ul>
        </div>
        <div v-if="analysis.gaps.length" class="flex flex-col gap-1.5">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">Gaps</p>
          <ul class="flex flex-col gap-1">
            <li v-for="(gap, index) in analysis.gaps" :key="index" class="flex items-start gap-1.5 text-sm">
              <UIcon name="i-lucide-minus" class="text-warning shrink-0 mt-0.5" size="16" />
              <span>{{ gap }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="analysis.skills.length" class="flex flex-wrap gap-1.5">
        <UBadge v-for="skill in analysis.skills" :key="skill" color="neutral" variant="subtle" size="sm">
          {{ skill }}
        </UBadge>
      </div>

      <USeparator />

      <div v-if="analysis.redFlags.length" class="flex flex-col gap-1.5">
        <p class="text-xs font-medium text-error uppercase tracking-wide">Red flags</p>
        <ul class="flex flex-col gap-1">
          <li v-for="(flag, index) in analysis.redFlags" :key="index" class="flex items-start gap-1.5 text-sm">
            <UIcon name="i-lucide-triangle-alert" class="text-error shrink-0 mt-0.5" size="16" />
            <span>{{ flag }}</span>
          </li>
        </ul>
      </div>

      <div v-if="analysis.interviewQuestions.length" class="flex flex-col gap-1.5">
        <p class="text-xs font-medium text-muted uppercase tracking-wide">Interview Questions</p>
        <ul class="flex flex-col gap-1">
          <li
            v-for="(question, index) in analysis.interviewQuestions"
            :key="index"
            class="flex items-start gap-1.5 text-sm"
          >
            <UIcon name="i-lucide-message-circle-question" class="text-primary shrink-0 mt-0.5" size="16" />
            <span>{{ question }}</span>
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>
