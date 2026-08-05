<script lang="ts" setup>
  import type { ContextMenuItem, FormSubmitEvent } from '@nuxt/ui';
  import type { ProjectColor } from '~/generated/prisma/enums';
  import type { FetchError } from 'ofetch';
  import type { Project } from '~/generated/prisma/client';
  import { projectUpdateSchema } from '~/types/schema';
  import type z from 'zod';

  type Props = {
    projectId: string;
    icon?: string;
    collapsed?: boolean;
    active?: boolean;
  };

  const props = defineProps<Props>();

  const toast = useToast();

  const contextOpen = ref(false);

  const { update, loading, remove } = useProject();

  const { data: projects } = useNuxtData<Project[]>('projects');

  const currentProject = computed(() => projects.value?.find((p) => p.id === props.projectId));

  if (!currentProject.value) {
    throw createError({
      status: 401,
      statusText: 'Project not found',
    });
  }

  const editMode = ref(false);
  const editState = reactive({
    name: currentProject.value.name,
  });
  const form = useTemplateRef('editForm');
  const formInput = useTemplateRef('editInput');

  const onBlur = async () => {
    if (editState.name.trim() === currentProject.value?.name) {
      editMode.value = false;
      return;
    }

    form.value?.submit();
  };

  type Schema = z.output<typeof projectUpdateSchema>;
  const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    try {
      const updated = await update(props.projectId, event.data);

      if (projects.value && updated) {
        projects.value = projects.value.map((p) => (p.id === props.projectId ? updated : p));
      }
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      editMode.value = false;
    }
  };

  type ColorMeta = {
    textClass: string;
    uiColor: string;
  };
  const projectColorsMap: Record<ProjectColor, ColorMeta> = {
    red: { textClass: 'text-error', uiColor: 'bg-error ring-error' },
    blue: { textClass: 'text-primary', uiColor: 'bg-primary ring-primary' },
    green: { textClass: 'text-success', uiColor: 'bg-success ring-success' },
    grey: { textClass: 'text-neutral-600', uiColor: 'bg-neutral-500 ring-neutral-300' },
    orange: { textClass: 'text-warning', uiColor: 'bg-warning ring-warning' },
    purple: { textClass: 'text-purple-500', uiColor: 'bg-purple-500 ring-purple-300' },
    yellow: { textClass: 'text-yellow-500', uiColor: 'bg-yellow-500 ring-yellow-300' },
  };

  const projectColorsClasses = computed(
    () =>
      Object.fromEntries(Object.entries(projectColorsMap).map(([key, v]) => [key, v.textClass])) as Record<
        ProjectColor,
        string
      >,
  );

  const radioGroupItems = computed(() =>
    (Object.keys(projectColorsMap) as ProjectColor[]).map((value) => ({
      value,
      ui: {
        base: [projectColorsMap[value].uiColor, 'relative ring-0 before:hidden hover:opacity-80'],
        indicator: [projectColorsMap[value].uiColor, 'after:hidden absolute inset-0'],
      },
    })),
  );

  const selectedColor = ref<ProjectColor>(currentProject.value.color);

  watch(selectedColor, async (newVal, oldVal) => {
    try {
      await update(props.projectId, { color: newVal });

      if (projects.value) {
        projects.value = projects.value.map((p) => (p.id === props.projectId ? { ...p, color: newVal } : p));
      }
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });

      selectedColor.value = oldVal;
    }
  });

  const deleteConfirmationOpen = ref(false);
  const onDelete = async () => {
    try {
      const deleted = await remove(props.projectId);
      if (projects.value) {
        projects.value = projects.value.filter((p) => p.id !== deleted?.id);
      }
      deleteConfirmationOpen.value = false;
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };

  const onEllipsisClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    target.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
      }),
    );
  };

  const contextMenuItems = ref<ContextMenuItem[][]>([
    [
      {
        label: 'View',
        icon: 'i-lucide-eye',
        to: `/dashboard/${currentProject.value.id}`,
      },
      {
        label: 'Rename',
        icon: 'i-lucide-pen',
        disabled: props.collapsed,
        onSelect: () => {
          contextOpen.value = false;
          editMode.value = true;

          setTimeout(() => {
            formInput.value?.inputRef?.focus();
          }, 200);
        },
      },
    ],
    [
      {
        slot: 'colors',
      },
    ],
    [
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => {
          deleteConfirmationOpen.value = true;
        },
      },
    ],
  ]);
</script>

<template>
  <UContextMenu v-model:open="contextOpen" :items="contextMenuItems" :ui="{ content: 'min-w-45' }">
    <template #default>
      <UTooltip
        :delay-duration="0"
        :disabled="!collapsed"
        :text="currentProject?.name"
        :content="{ align: 'center', side: 'right' }"
      >
        <div
          :class="[
            'flex items-center gap-2 w-full rounded-lg',
            { 'p-4': !collapsed, 'p-1 justify-center': collapsed, 'bg-primary-100': active },
          ]"
        >
          <UIcon size="20" :name="icon" :class="[currentProject ? projectColorsClasses[currentProject.color] : '']" />
          <template v-if="!collapsed">
            <UForm v-if="editMode" ref="editForm" :schema="projectUpdateSchema" :state="editState" @submit="onSubmit">
              <UFormField name="name">
                <UInput
                  ref="editInput"
                  v-model="editState.name"
                  size="xs"
                  :loading="loading"
                  loading-icon="i-lucide-loader"
                  :default-value="currentProject?.name"
                  @blur="onBlur"
                />
              </UFormField>
            </UForm>
            <span v-else class="text-base">{{ currentProject?.name }}</span>
          </template>
          <UButton
            v-if="!collapsed"
            variant="ghost"
            color="neutral"
            icon="i-lucide-ellipsis-vertical"
            type="button"
            aria-label="Open context menu"
            :class="['group-hover:text-primary ml-auto', { 'text-primary': active }]"
            @click="onEllipsisClick"
          />
        </div>
      </UTooltip>
    </template>

    <template #colors>
      <UIcon v-if="loading" name="i-lucide-loader" class="mx-auto shrink-0 size-5 text-primary animate-spin" />
      <div v-else class="flex items-center gap-2">
        <URadioGroup
          v-model="selectedColor"
          :items="radioGroupItems"
          orientation="horizontal"
          variant="list"
          :ui="{
            wrapper: 'hidden',
          }"
        />
      </div>
    </template>

    <template #colors-trailing>
      <UIcon name="i-lucide-loader" class="shrink-0 size-5 text-primary animate-spin" />
    </template>
  </UContextMenu>

  <AppConfirmation
    v-model="deleteConfirmationOpen"
    title="Delete project"
    :loading="loading"
    description="Are you sure you want to delete this project. This action can not be reverted"
    :action="{ color: 'error', label: 'Delete' }"
    @submit="onDelete"
  />
</template>
