<script lang="ts" setup>
  import type { Notification, Project } from '~/generated/prisma/client';
  import { authClient } from '~/lib/auth-client';

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  const route = useRoute();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const { data: notifications } = useNuxtData<Notification[]>('notifications');

  const { data: session } = await authClient.useSession(useAuthFetch);

  const { open } = useNotification();

  const currentProject = computed(() => projects.value?.find((project) => project.id === route.params.id));

  const [{ pending: loading, error }, { data: analyses, pending: loadingAnalysis, error: errorAnalysis }] =
    await Promise.all([
      useLazyFetch('/api/file', {
        key: `project-files-${currentProject.value?.id}`,
        query: { projectId: currentProject.value?.id },
      }),
      useLazyFetch('/api/analysis', {
        query: {
          projectId: currentProject.value?.id,
        },
        key: `project-analysis-${currentProject?.value?.id}`,
      }),
    ]);

  const { error: realtimeError, connect, disconnect } = useRealtimeConnection(currentProject.value?.id ?? '');

  onMounted(() => {
    connect();
  });

  onBeforeUnmount(() => {
    disconnect();
  });

  const unreadNotifications = computed(() => notifications.value?.filter((n) => !n.read) ?? []);
</script>

<template>
  <UDashboardPanel id="project">
    <template #header>
      <UDashboardNavbar :title="currentProject?.name ?? 'Unknown'" :ui="{ root: 'sm:px-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ProjectExport
            v-if="currentProject"
            :project-id="currentProject.id"
            :project-name="currentProject.name"
            :disabled="!analyses?.length"
          />
          <UButton
            to="/billing"
            variant="soft"
            :label="`${session?.user.tokens ?? 0} tokens`"
            icon="i-lucide-coins"
            class="justify-center"
          />
          <UButton color="neutral" variant="ghost" square aria-label="Notifications" @click="open = true">
            <UChip color="error" :show="unreadNotifications.length != 0" inset>
              <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
            </UChip>
          </UButton>
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
