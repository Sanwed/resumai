<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import type { ProjectColor } from '~/generated/prisma/enums';

  type Props = {
    collapsed?: boolean;
  };

  withDefaults(defineProps<Props>(), {
    collapsed: false,
  });

  const { data: projects, pending, error } = await useLazyFetch('/api/project', { key: 'projects' });

  const route = useRoute();

  const linkProjects: ComputedRef<(NavigationMenuItem & { id: string; color: ProjectColor })[]> = computed(
    () =>
      projects.value?.map((project) => ({
        id: project.id,
        label: project.name,
        icon: 'i-material-symbols-folder',
        type: 'link',
        color: project.color,
        active: route.params.projectId === project.id,
        to: `/dashboard/${project.id}`,
      })) ?? [],
  );
</script>

<template>
  <div>
    <div v-if="pending" class="h-60 w-full flex items-center justify-center flex-col text-muted">
      <UIcon name="i-lucide-loader" size="30" class="animate-spin" />
    </div>
    <div v-else-if="error" class="h-60 w-full flex items-center justify-center flex-col gap-2 text-muted">
      <UIcon name="i-lucide-circle-x" size="30" />
      <p class="text-lg">{{ error.statusMessage }}</p>
    </div>
    <template v-else-if="!projects?.length">
      <ProjectButtonCreate :collapsed="collapsed" />

      <div class="h-60 w-full flex items-center justify-center flex-col gap-2 text-muted">
        <UIcon name="i-lucide-folder-x" size="30" />
        <p class="text-lg">Projects not found</p>
      </div>
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
          link: 'p-0 bg-neutral-100 border border-neutral-400 hover:bg-primary-100 hover:border-primary-400 hover:text-primary focus-visible:bg-primary-100 focus-visible:border-primary-400 focus-visible:before:outline-0 focus-visible:text-primary rounded-lg',
        }"
      >
        <template #item="{ item }">
          <ProjectCard :project-id="item.id" :icon="item.icon" :collapsed="collapsed" />
        </template>
      </UNavigationMenu>
    </div>
  </div>
</template>
