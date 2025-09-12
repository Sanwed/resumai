<script lang="ts" setup>
import type { Projects } from '~/generated/prisma';
import { authClient } from '~/lib/auth-client';

const { data: session } = await authClient.useSession(useFetch);

const { data: projects, pending, refresh } = await useFetch<Projects[]>('/api/projects', {
  query: { userId: session.value?.user.id },
});
</script>

<template>
  <div v-if="session" class="flex flex-col gap-y-4 md:gap-y-6 p-4 md:px-8 max-w-[] mx-auto">
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
      <h2 class="font-medium text-xl">Проекты</h2>
      <ProjectCarouselSkeleton v-if="pending" />
      <ProjectEmpty v-else-if="!projects" />
      <ProjectCarousel v-else :projects="projects" />
    </div>
  </div>
</template>