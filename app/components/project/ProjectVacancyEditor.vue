<script lang="ts" setup>
  import { MdEditor, MdPreview, type ToolbarNames } from 'md-editor-v3';
  import type { FetchError } from 'ofetch';
  import type { Project } from '~/generated/prisma/client';

  type Props = {
    projectId: string;
    initialText: string;
  };

  const props = defineProps<Props>();

  const toolbars: ToolbarNames[] = [
    'bold',
    'italic',
    'strikeThrough',
    'title',
    'unorderedList',
    'orderedList',
    'link',
    '=',
    0,
  ];

  const toast = useToast();

  const { editMode, collapsed } = useVacancyState(props.projectId);

  const { data: projects } = useNuxtData<Project[]>('projects');

  const prevText = ref(props.initialText);
  const currentText = ref(props.initialText);

  const { update } = useProject();

  const onCancel = () => {
    currentText.value = prevText.value;
    editMode.value = false;
  };

  const onSave = async () => {
    try {
      const updated = await update(props.projectId, { vacancyText: currentText.value });

      if (projects.value && updated) {
        projects.value = projects.value.map((p) => (p.id === props.projectId ? updated : p));
      }

      prevText.value = currentText.value;
      editMode.value = false;
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
  <UPageCard :ui="{ container: 'p-0 sm:p-0', body: 'w-full' }">
    <template #body>
      <div v-if="!editMode" class="flex flex-col">
        <div :class="['p-1 flex justify-between items-center border-default', collapsed ? 'border-none' : 'border-b']">
          <button
            type="button"
            class="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 dark:focus-visible:outline-amber-300"
            :aria-label="collapsed ? 'Expand vacancy description' : 'Collapse vacancy description'"
            :aria-expanded="!collapsed"
            :aria-controls="`vacancy-description-${projectId}`"
            @click="collapsed = !collapsed"
          >
            <UIcon
              name="i-lucide-chevron-up"
              size="16"
              :class="['transition-transform', { 'rotate-180': collapsed }]"
              aria-hidden="true"
            />
          </button>
          <p class="mr-auto ml-2 font-medium text-sm">Vacancy description</p>
          <UButton icon="i-lucide-pencil" label="Edit" size="xs" @click="editMode = true" />
        </div>
        <MdPreview
          v-if="!collapsed"
          :id="`vacancy-description-${projectId}`"
          v-model="currentText"
          class="h-91.75! overflow-auto! border-none! bg-transparent! p-4"
        />
      </div>
      <MdEditor
        v-else
        v-model="currentText"
        :preview="false"
        :toolbars="toolbars"
        language="en-US"
        :footers="[]"
        class="border-none! bg-transparent! h-100!"
      >
        <template #defToolbars>
          <div class="flex items-center gap-2">
            <UButton label="Save" size="xs" loading-auto loading-icon="i-lucide-loader" @click="onSave" />
            <UButton label="Cancel" variant="soft" color="neutral" size="xs" @click="onCancel" />
          </div>
        </template>
      </MdEditor>
    </template>
  </UPageCard>
</template>

<style scoped>
  :deep(.md-editor-preview) h1,
  :deep(.md-editor-preview) h2,
  :deep(.md-editor-preview) h3 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  :deep(.md-editor-preview) p {
    margin: 0.4em 0;
  }
</style>
