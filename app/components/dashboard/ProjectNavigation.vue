<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import type { Project } from '~/generated/prisma/client';
  import type { ProjectColor } from '~/generated/prisma/enums';
  import type { FetchError } from 'ofetch';

  type Props = {
    loading?: boolean;
    collapsed?: boolean;
    error?: FetchError;
  };

  defineProps<Props>();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const route = useRoute();

  const linkProjects = computed<(NavigationMenuItem & { id: string; color: ProjectColor })[]>(
    () =>
      projects.value?.map((project) => ({
        id: project.id,
        label: project.name,
        icon: 'i-material-symbols-folder',
        type: 'link',
        color: project.color,
        active: route.params.id === project.id,
        to: `/dashboard/${project.id}`,
      })) ?? [],
  );
</script>

<template>
  <div>
    <div
      v-if="loading"
      role="status"
      aria-live="polite"
      class="h-60 w-full flex items-center justify-center flex-col text-muted"
    >
      <UIcon name="i-lucide-loader" size="30" class="animate-spin" aria-hidden="true" />
      <span class="sr-only">Loading projects</span>
    </div>
    <div
      v-else-if="error"
      role="alert"
      class="h-60 w-full flex items-center justify-center flex-col gap-2 text-muted"
    >
      <UIcon name="i-lucide-circle-x" size="30" aria-hidden="true" />
      <p class="text-lg">{{ error.statusMessage }}</p>
    </div>
    <template v-else-if="!projects?.length">
      <ProjectButtonCreate :collapsed="collapsed" />
      <UEmpty icon="i-lucide-file" variant="naked" title="Projects not found" />
    </template>
    <div v-else class="flex flex-col gap-4">
      <ProjectButtonCreate :collapsed="collapsed" />
      <UNavigationMenu
        :collapsed="collapsed"
        :items="linkProjects"
        orientation="vertical"
        :ui="{
          root: '[&>div]:w-full',
          list: 'w-full',
          item: 'w-full mb-4',
          link: 'p-0 bg-neutral-100 border border-neutral-400 hover:bg-primary-100 hover:border-primary-400 hover:text-primary focus-visible:bg-primary-100 focus-visible:border-primary-400 focus-visible:before:outline-0 focus-visible:text-primary rounded-lg dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:border-neutral-400',
        }"
      >
        <template #item="{ item }">
          <ProjectCard :project-id="item.id" :icon="item.icon" :active="item.active" :collapsed="collapsed" />
        </template>
      </UNavigationMenu>
    </div>
  </div>
</template>
