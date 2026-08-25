<script lang="ts" setup>
  import type { DropdownMenuItem } from '@nuxt/ui';

  type Props = {
    projectId: string;
    projectName: string;
    disabled?: boolean;
  };
  const props = defineProps<Props>();

  const download = async (projectId: string, route: string, projectName?: string, suffix: 'pdf' | 'csv' = 'pdf') => {
    const blob = await $fetch<Blob>(`/api/project/${projectId}/${route}`, { responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-report.${suffix}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const items = computed<DropdownMenuItem[]>(() => [
    {
      label: 'PDF',
      icon: 'i-tabler-file-type-pdf',
      onSelect: () => {
        download(props.projectId, 'export', props.projectName, 'pdf');
      },
    },
    {
      label: 'CSV',
      icon: 'i-tabler-file-type-csv',
      onSelect: () => {
        download(props.projectId, 'export-csv', props.projectName, 'csv');
      },
    },
  ]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :disabled="disabled"
    :content="{ align: 'end', side: 'bottom' }"
    :ui="{ content: 'min-w-40' }"
  >
    <UButton
      label="Export"
      variant="ghost"
      color="info"
      icon="i-lucide-download"
      :disabled="disabled"
      :ui="{ label: 'sr-only md:not-sr-only' }"
    />
  </UDropdownMenu>
</template>
