<script lang="ts" setup>
  import type { FetchError } from 'ofetch';
  import type { Project } from '~/generated/prisma/client';

  const { create } = useProject();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const toast = useToast();

  const onCreate = async () => {
    try {
      const created = await create({ name: `Project #${(projects.value?.length ?? 0) + 1}` });

      if (projects.value && created) {
        projects.value = [...projects.value, created];
      }
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };
</script>

<template>
  <UButton
    label="Create new"
    loading-auto
    loading-icon="i-lucide-loader"
    leading-icon="i-lucide-plus"
    type="button"
    class="w-max"
    @click="onCreate"
  />
</template>
