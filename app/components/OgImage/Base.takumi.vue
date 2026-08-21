<script setup lang="ts">
  type Props = {
    title?: string;
    subTitle?: string;
    description?: string;
  };

  const props = withDefaults(defineProps<Props>(), {
    title: 'AI Resume Screening & Job Matching',
    subTitle: undefined,
    description: 'Analyze resumes, compare candidates, and make confident hiring decisions with AI-powered insights.',
  });

  const displayTitle = computed(() => props.title.trim() || 'AI Resume Screening & Job Matching');
  const displayDescription = computed(
    () =>
      props.description.trim() ||
      'Analyze resumes, compare candidates, and make confident hiring decisions with AI-powered insights.',
  );

  const titleClass = computed(() => {
    if (displayTitle.value.length > 64) return 'text-[56px]';
    if (displayTitle.value.length > 46) return 'text-[64px]';
    return 'text-[72px]';
  });
</script>

<template>
  <div class="relative flex h-full w-full flex-col overflow-hidden bg-neutral-50 p-15">
    <div class="flex items-center gap-4">
      <div class="flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-primary p-px">
        <AppLogo class="size-full" collapsed />
      </div>
      <span class="text-3xl leading-none font-bold tracking-[-0.5px] text-indigo-900">ResumAI</span>
    </div>
    <div class="my-6 h-1.5 w-20.5 rounded-full bg-indigo-500" />

    <div class="relative flex mr-30 flex-1 flex-col justify-center">
      <p v-if="subTitle" class="mb-2 text-4xl font-medium text-primary">{{ subTitle }}</p>
      <h1 class="m-0 block max-w-225 overflow-hidden font-bold tracking-[-1px] leading-[1.04]" :class="titleClass">
        {{ displayTitle }}
      </h1>

      <p class="mt-6 block max-w-210 overflow-hidden text-[26px] leading-[1.38] font-normal text-neutral-700">
        {{ displayDescription }}
      </p>
    </div>
  </div>
</template>
