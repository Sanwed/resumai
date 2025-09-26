<script lang="ts" setup>
import { MAX_USER_PROJECTS } from '~/constants';
import type { Projects } from '~/generated/prisma';
import { authClient } from '~/lib/auth-client';

const { data: session } = await authClient.useSession(useFetch);

const { data: projects, pending, refresh } = await useFetch<Projects[]>('/api/projects');
</script>

<template>
  <div v-if="session" class="flex flex-col gap-y-4 md:gap-y-6 p-4 md:px-8 max-w-7xl mx-auto">
    <h1 class="font-medium text-2xl">Привет, {{ session.user.name }}!</h1>
    <div class="flex gap-4">
      <FormCreateProject @on-success="refresh()">
        <template #toggle>
          <UButton size="lg" class="gap-1">
            <UIcon name="i-material-symbols-add-rounded" class="size-5" />
            Создать проект
          </UButton>
        </template>
      </FormCreateProject>
    </div>
    <div class="flex flex-col gap-y-2 md:gap-y-4">
      <div class="flex items-center justify-between gap-x-2">
        <h2 class="font-medium text-xl">Проекты</h2>
        <p class="text-sm text-muted">{{ projects?.length }} из {{ MAX_USER_PROJECTS }}</p>
      </div>
      <ProjectCarouselSkeleton v-if="pending" />
      <ProjectEmpty v-else-if="!projects || projects.length === 0" />
      <ProjectCarousel v-else :projects="projects" />
    </div>
  </div>
</template>