<script lang="ts" setup>
  import type { Project } from '~/generated/prisma/client';

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  const route = useRoute();

  const { pending: loading, error } = await useLazyFetch(`/api/file/${route.params.id}`, {
    key: `project-files-${route.params.id}`,
  });
  const { data: projects } = useNuxtData<Project[]>('projects');

  const currentProject = computed(() => projects.value?.find((project) => project.id === route.params.id));

  useSeoMeta({
    title: 'Dashboard',
    ogTitle: 'Dashboard',
    description:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
    ogDescription:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
  });
</script>

<template>
  <UDashboardPanel id="project">
    <template #header>
      <UDashboardNavbar :title="currentProject?.name ?? 'Unknown'" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="!currentProject" class="size-full flex flex-col items-center justify-center gap-y-2">
        <UEmpty
          icon="i-lucide-file"
          size="xl"
          variant="subtle"
          title="Project not found"
          description="Project does not exist or was deleted"
        />
      </div>
      <div v-else class="flex gap-4">
        <div class="flex flex-col gap-4 grow max-w-1/2">
          <ProjectVacancyEditor :project-id="currentProject.id" :initial-text="currentProject.vacancyText ?? ''" />
          <ProjectAnalysis />
        </div>
        <ProjectFileUpload
          :project-id="currentProject.id"
          :loading="loading"
          :error="error"
          class="self-start sticky top-0"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
