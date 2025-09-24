<script lang="ts" setup>
import type { Projects, Tags } from '~/generated/prisma';

type Props = {
  project: Projects,
}

const { project } = defineProps<Props>();

const { data: tags } = useFetch<Tags[]>('/api/project-tags', {
  query: { projectId: project.id },
});

const createdDate = computed(() => new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})
  .format(new Date(project.createdAt)))
</script>

<template>
  <UCard
    role="button"
    tabindex="0"
    :ui="{
      root: ['w-sm block ring-transparent cursor-pointer group focus:outline-none'],
      header: ['border-none p-4 sm:px-4 transition-colors', project.importanceLevel ? 'group-hover:bg-warning/70 group-focus-visible:bg-warning/70 bg-warning/50' : 'group-hover:bg-slate-300 group-focus-visible:bg-slate-300 bg-slate-200'],
      body: 'sm:p-4',
      footer: 'sm:p-4',
    }"
    @click="navigateTo(`/projects/${project.id}`)"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">{{ project.name }}</h3>
        <div class="flex items-center gap-2">
          <div v-if="project.importanceLevel" class="flex items-center bg-warning p-0.5 rounded-full">
            <UIcon v-for="i in project.importanceLevel" :key="i" size="12" name="i-humbleicons-exclamation" />
          </div>
          <NuxtLink :to="`/projects/${project.id}/settings`" class="size-5 transition-transform hover:scale-110">
            <UIcon class="size-full" name="i-material-symbols-settings" />
          </NuxtLink>
        </div>
      </div>
    </template>

    <div class="flex items-start gap-x-4">
      <div class="shrink-0 size-10 rounded-sm bg-primary-50 border border-primary-200 flex justify-center items-center">
        <NuxtImg v-if="project.image" :src="project.image" :alt="project.name" width="10" height="10" />
        <UIcon v-else name="i-material-symbols-image" class="size-8 text-primary/50" />
      </div>
      <p v-if="project.description" class="text-sm text-slate-600 text-left">{{ project.description }}</p>
      <UButton class="shrink-0 ml-auto size-10 flex items-center justify-center p-0" variant="outline"
        aria-label="Скачать данные" @click.prevent>
        <UIcon name="i-material-symbols-download-2" class="size-5" />
      </UButton>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <ul v-if="tags" class="flex gap-2 items-center">
          <li v-for="tag in tags" :key="tag.id">
            <Tag :tag="tag" tabindex="-1" />
          </li>
        </ul>
        <p class="ml-auto text-muted text-sm">{{ createdDate }}</p>
      </div>
    </template>
  </UCard>
</template>