<script lang="ts" setup>
import type { Projects } from '~/generated/prisma';

type Props = {
  project: Projects;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-col gap-y-8 p-4 md:px-8 max-w-7xl mx-auto">
    <div class="flex flex-col gap-y-2">
      <NuxtLink to="/overview" class="flex items-center text-sm text-muted">
        <UIcon name="i-material-symbols-arrow-back-ios" />
        <p>Назад к проектам</p>
      </NuxtLink>
      <h1 class="font-medium text-2xl">{{ project.name }}</h1>
    </div>
    <div class="relative rounded-lg overflow-hidden bg-white border border-primary-200">
      <div class="border-b border-primary-200 py-1 px-3 flex items-center justify-between">
        <h2 class="font-medium text-lg">Описание вакансии</h2>
        <UButton variant="ghost" class="size-8 p-2 items-center justify-center">
          <UIcon name="i-material-symbols-edit" class="size-full" />
        </UButton>
      </div>
      <div class="p-3">
        <p>{{ project?.vacancyText }}</p>
      </div>
    </div>
    <div class="flex flex-col gap-y-4">
      <h2 class="font-medium text-xl">Резюме сотрудников</h2>
      <ProjectDropzone />
    </div>
  </div>
</template>