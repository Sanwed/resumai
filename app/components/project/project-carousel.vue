<script lang="ts" setup>
import type { Projects } from '~/generated/prisma';

type Props = {
  projects: Projects[];
}

defineProps<Props>();
</script>

<template>
  <UCarousel v-slot="{ item }" :items="projects" drag-free :ui="{
    item: 'basis-auto',
    viewport: 'overflow-y-hidden overflow-x-auto scrollbar-none'
  }">
    <ProjectCard :project="item" />
  </UCarousel>
</template>