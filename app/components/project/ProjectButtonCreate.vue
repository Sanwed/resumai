<script lang="ts" setup>
  import type { FetchError } from 'ofetch';
  import type { Project } from '~/generated/prisma/client';

  type Props = {
    collapsed?: boolean;
  };
  defineProps<Props>();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const toast = useToast();

  const { create } = useProject();
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
    :label="collapsed ? undefined : 'Create new'"
    loading-auto
    loading-icon="i-lucide-loader"
    leading-icon="i-lucide-plus"
    type="button"
    :class="['w-max', { 'rounded-full': collapsed }]"
    @click="onCreate"
  />
</template>
