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
  const roundedProgress = computed(() => Math.round(targetProgress.value));

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
        label: 'Contact phone',
        icon: 'i-lucide-phone',
        to: `tel:${currentAnalysis.value?.phone}`,
        disabled: !currentAnalysis.value?.phone,
      },
      {
        label: 'Email',
        icon: 'i-lucide-mail',
        to: `mailto:${currentAnalysis.value?.email}`,
        disabled: !currentAnalysis.value?.email,
      },
      {
        label: 'LinkedIn',
        icon: 'i-simple-icons-linkedin',
        to: `${currentAnalysis.value?.linkedin}`,
        disabled: !currentAnalysis.value?.linkedin,
        target: '_blank',
      },
      {
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: `${currentAnalysis.value?.github}`,
        disabled: !currentAnalysis.value?.github,
        target: '_blank',
      },
      {
        label: 'Personal website',
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
    <UCard v-if="loading" role="status" aria-live="polite" :ui="{ body: 'sm:p-4' }">
      <div class="size-full flex justify-center items-center">
        <UIcon name="i-lucide-loader" size="30" class="animate-spin" aria-hidden="true" />
        <span class="sr-only">Loading analysis</span>
      </div>
    </UCard>
    <UCard v-else-if="error" role="alert" :ui="{ body: 'sm:p-4' }">
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
    <UCard v-else-if="!currentAnalysis" role="status" aria-live="polite" :ui="{ body: 'sm:p-4' }">
      <UEmpty
        icon="i-lucide-file"
        loading
        loading-icon="i-lucide-loader"
        size="xl"
        variant="naked"
        title="Analysis creating"
      />
    </UCard>
    <UCard v-else-if="currentAnalysis.status === 'failed'" role="alert" :ui="{ body: 'sm:p-4' }">
      <UEmpty icon="i-lucide-x" size="xl" variant="naked" :title="currentAnalysis.statusMessage ?? ''" />
    </UCard>
    <UCard
      v-else-if="currentAnalysis.status !== 'succeed'"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      :ui="{ body: 'sm:p-4' }"
    >
      <UEmpty
        icon="i-lucide-file"
        loading
        loading-icon="i-lucide-loader"
        size="xl"
        variant="naked"
        :title="currentAnalysis.statusMessage ?? ''"
        :description="`${roundedProgress}% complete`"
      />
    </UCard>
    <UCard v-else-if="currentAnalysis.incomplete" role="status" aria-live="polite" :ui="{ body: 'sm:p-4' }">
      <UEmpty icon="i-lucide-circle-x" size="xl" variant="naked" :title="currentAnalysis.incompleteReason ?? ''" />
    </UCard>
    <UCard v-else :ui="{ header: 'p-2 sm:py-2 sm:px-4', body: 'sm:p-4', footer: 'bg-muted' }">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

          <div class="flex items-center justify-between gap-2">
            <UNavigationMenu
              :items="contactItems"
              :ui="{ link: 'p-1', linkLeadingIcon: 'size-6 lg:size-4', linkLabel: 'sr-only', item: 'py-0' }"
            />
            <UBadge :color="compatibilityMeta.color" variant="subtle" class="shrink-0">
              {{ currentAnalysis.compatibility }}%
            </UBadge>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div>
          <UProgress
            :model-value="currentAnalysis.compatibility"
            :color="compatibilityMeta.color"
            size="sm"
            aria-label="Candidate compatibility"
            :aria-valuetext="`${currentAnalysis.compatibility}% — ${compatibilityMeta.label}`"
          />
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
                <UIcon
                  name="i-lucide-check"
                  class="text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5"
                  size="16"
                  aria-hidden="true"
                />
                <span class="text-toned">{{ strength }}</span>
              </li>
            </ul>
          </div>
          <div v-if="currentAnalysis.gaps.length" class="flex flex-col gap-1.5">
            <p class="text-xs font-medium text-muted uppercase tracking-wide">Gaps</p>
            <ul class="flex flex-col gap-1">
              <li v-for="(gap, index) in currentAnalysis.gaps" :key="index" class="flex items-start gap-1.5 text-sm">
                <UIcon
                  name="i-lucide-minus"
                  class="text-amber-800 dark:text-amber-300 shrink-0 mt-0.5"
                  size="16"
                  aria-hidden="true"
                />
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
          <p class="text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wide">Red flags</p>
          <ul class="flex flex-col gap-1">
            <li v-for="(flag, index) in currentAnalysis.redFlags" :key="index" class="flex items-start gap-1.5 text-sm">
              <UIcon
                name="i-lucide-triangle-alert"
                class="text-red-800 dark:text-red-300 shrink-0 mt-0.5"
                size="16"
                aria-hidden="true"
              />
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
