<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import type { Analysis } from '~/generated/prisma/client';

  type Props = {
    projectId: string;
    loading?: boolean;
    error?: string;
  };
  const props = defineProps<Props>();

  const { selectedFileId } = useFile(props.projectId);
  const { data: analyses } = useNuxtData<Analysis[]>(`project-analysis-${props.projectId}`);

  const currentAnalysis = computed(() => analyses.value?.find((el) => el.fileId === selectedFileId.value));

  const targetProgress = computed(() => currentAnalysis.value?.progress ?? 0);

  const animatedProgress = useTransition(targetProgress, {
    duration: 600,
  });

  const roundedProgress = computed(() => Math.round(animatedProgress.value));

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
      compatibilityMap.find((entry) => currentAnalysis.value?.compatibility ?? 0 >= entry.threshold)?.meta ??
      compatibilityMap.at(-1)!.meta,
  );

  const contactItems: ComputedRef<NavigationMenuItem[]> = computed(() => {
    const items = [
      {
        'aria-label': 'Contact phone',
        icon: 'i-lucide-phone',
        to: `tel:${currentAnalysis.value?.phone}`,
        disabled: !currentAnalysis.value?.phone,
      },
      {
        'aria-label': 'Email',
        icon: 'i-lucide-mail',
        to: `mailto:${currentAnalysis.value?.email}`,
        disabled: !currentAnalysis.value?.email,
      },
      {
        'aria-label': 'LinkedIn',
        icon: 'i-simple-icons-linkedin',
        to: `${currentAnalysis.value?.linkedin}`,
        disabled: !currentAnalysis.value?.linkedin,
        target: '_blank',
      },
      {
        'aria-label': 'GitHub',
        icon: 'i-simple-icons-github',
        to: `${currentAnalysis.value?.github}`,
        disabled: !currentAnalysis.value?.github,
        target: '_blank',
      },
      {
        'aria-label': 'Personal Website',
        icon: 'i-lucide-globe',
        to: `${currentAnalysis.value?.website}`,
        disabled: !currentAnalysis.value?.website,
        target: '_blank',
      },
    ];

    return items.filter((item) => !item.disabled);
  });
</script>

<template>
  <div>
    <UCard v-if="loading" :ui="{ body: 'sm:p-4' }">
      <div class="size-full flex justify-center items-center">
        <UIcon name="i-lucide-loader" size="30" class="animate-spin" />
      </div>
    </UCard>
    <UCard v-else-if="error" :ui="{ body: 'sm:p-4' }">
      <UEmpty icon="i-lucide-x" size="xl" variant="naked" title="Error" :description="error" />
    </UCard>
    <UCard v-else-if="!selectedFileId" :ui="{ body: 'sm:p-4' }">
      <UEmpty
        icon="i-lucide-file"
        size="xl"
        variant="naked"
        title="Select file"
        description="Click on the file on the right sidebar to see analysis results"
      />
    </UCard>
    <UCard v-else-if="!currentAnalysis" :ui="{ body: 'sm:p-4' }">
      <UEmpty
        icon="i-lucide-file"
        loading
        loading-icon="i-lucide-loader"
        size="xl"
        variant="naked"
        title="Analysis creating"
      />
    </UCard>
    <UCard v-else-if="currentAnalysis.status === 'failed'" :ui="{ body: 'sm:p-4' }">
      <UEmpty icon="i-lucide-x" size="xl" variant="naked" :title="currentAnalysis.statusMessage ?? ''" />
    </UCard>
    <UCard v-else-if="currentAnalysis.status !== 'succeed'" :ui="{ body: 'sm:p-4' }">
      <UEmpty
        icon="i-lucide-file"
        loading
        loading-icon="i-lucide-loader"
        size="xl"
        variant="naked"
        :title="currentAnalysis.statusMessage ?? ''"
        :description="`${roundedProgress}%`"
      />
    </UCard>
    <UCard v-else-if="currentAnalysis.incomplete" :ui="{ body: 'sm:p-4' }">
      <UEmpty icon="i-lucide-circle-x" size="xl" variant="naked" :title="currentAnalysis.incompleteReason ?? ''" />
    </UCard>
    <UCard v-else :ui="{ header: 'sm:py-2 sm:px-4', body: 'sm:p-4', footer: 'bg-muted' }">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <UAvatar :alt="currentAnalysis.candidateName ?? 'Candidate'" icon="i-lucide-user-round" class="shrink-0" />
            <div>
              <p class="font-medium text-base truncate">{{ currentAnalysis.candidateName ?? 'Candidate' }}</p>
              <p class="text-xs text-muted">
                Relevant experience:
                {{
                  currentAnalysis?.relevantExperienceYears
                    ? parseExperienceDuration(currentAnalysis.relevantExperienceYears)
                    : '—'
                }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UNavigationMenu :items="contactItems" :ui="{ link: 'p-1', linkLeadingIcon: 'size-4' }" />
            <UBadge :color="compatibilityMeta.color" variant="subtle" class="shrink-0">
              {{ currentAnalysis.compatibility }}%
            </UBadge>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div>
          <UProgress :model-value="currentAnalysis.compatibility" :color="compatibilityMeta.color" size="sm" />
          <p class="text-xs text-muted mt-1">{{ compatibilityMeta.label }}</p>
        </div>

        <p class="text-sm text-highlighted line-clamp-3">{{ currentAnalysis.verdict }}</p>

        <div
          v-if="currentAnalysis.strengths.length || currentAnalysis.gaps.length"
          class="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <div v-if="currentAnalysis.strengths.length" class="flex flex-col gap-1.5">
            <p class="text-xs font-medium text-muted uppercase tracking-wide">Strengths</p>
            <ul class="flex flex-col gap-1">
              <li
                v-for="(strength, index) in currentAnalysis.strengths"
                :key="index"
                class="flex items-start gap-1.5 text-sm"
              >
                <UIcon name="i-lucide-check" class="text-success shrink-0 mt-0.5" size="16" />
                <span class="text-toned">{{ strength }}</span>
              </li>
            </ul>
          </div>
          <div v-if="currentAnalysis.gaps.length" class="flex flex-col gap-1.5">
            <p class="text-xs font-medium text-muted uppercase tracking-wide">Gaps</p>
            <ul class="flex flex-col gap-1">
              <li v-for="(gap, index) in currentAnalysis.gaps" :key="index" class="flex items-start gap-1.5 text-sm">
                <UIcon name="i-lucide-minus" class="text-warning shrink-0 mt-0.5" size="16" />
                <span>{{ gap }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="currentAnalysis.skills.length" class="flex flex-wrap gap-1.5">
          <UBadge v-for="skill in currentAnalysis.skills" :key="skill" color="neutral" variant="subtle" size="sm">
            {{ skill }}
          </UBadge>
        </div>

        <USeparator />

        <div v-if="currentAnalysis.redFlags.length" class="flex flex-col gap-1.5">
          <p class="text-xs font-medium text-error uppercase tracking-wide">Red flags</p>
          <ul class="flex flex-col gap-1">
            <li v-for="(flag, index) in currentAnalysis.redFlags" :key="index" class="flex items-start gap-1.5 text-sm">
              <UIcon name="i-lucide-triangle-alert" class="text-error shrink-0 mt-0.5" size="16" />
              <span>{{ flag }}</span>
            </li>
          </ul>
        </div>

        <div v-if="currentAnalysis.interviewQuestions.length" class="flex flex-col gap-1.5">
          <p class="text-xs font-medium text-muted uppercase tracking-wide">Interview Questions</p>
          <ul class="flex flex-col gap-1">
            <li
              v-for="(question, index) in currentAnalysis.interviewQuestions"
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
  </div>
</template>
