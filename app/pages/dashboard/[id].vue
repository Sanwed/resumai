<script lang="ts" setup>
  import type { Project } from '~/generated/prisma/client';

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  const route = useRoute();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const currentProject = computed(() => projects.value?.find((project) => project.id === route.params.id));

  const { pending: loading, error } = await useLazyFetch('/api/file', {
    key: `project-files-${currentProject.value?.id}`,
    query: { projectId: currentProject.value?.id },
  });

  const { pending: loadingAnalysis, error: errorAnalysis } = await useLazyFetch('/api/analysis', {
    query: {
      projectId: currentProject.value?.id,
    },
    key: `project-analysis-${currentProject?.value?.id}`,
  });

  const { error: realtimeError, connect, disconnect } = useRealtimeConnection(currentProject.value?.id ?? '');

  onMounted(() => {
    connect();
  });

  onBeforeUnmount(() => {
    disconnect();
  });

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
        <div class="flex flex-col gap-4 grow">
          <ProjectVacancyEditor :project-id="currentProject.id" :initial-text="currentProject.vacancyText ?? ''" />
          <ProjectAnalysis
            :project-id="currentProject.id"
            :loading="loadingAnalysis"
            :error="realtimeError || errorAnalysis?.statusMessage"
          />
        </div>
        <ProjectFileUpload
          :project-id="currentProject.id"
          :has-vacancy-text="!currentProject.vacancyText"
          :loading="loading"
          :error="error"
          class="self-start sticky top-0"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
