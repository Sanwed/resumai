<script lang="ts" setup>
import type { Projects } from '~/generated/prisma';

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
})

const route = useRoute();

const { data: projects } = await useFetch<Projects[]>('/api/projects', {
  query: { projectId: route.params.id },
});

const project = computed(() => projects.value?.[0]);

useHead({
  title: project.value?.name,
  meta: () => [
    { name: 'description', content: project.value?.description },
    { property: 'og:title', content: project.value?.name },
    { property: 'og:description', content: project.value?.description },
  ]
})
</script>

<template>
  <PageProject :project="project" />
</template>