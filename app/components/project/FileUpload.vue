<script lang="ts" setup>
  import { AvailableFileFormats, MAX_RESUME_FILE_SIZE } from '~/constants';
  import type { ProjectFile } from '~/generated/prisma/client';
  import type { FetchError } from 'ofetch';

  type Props = {
    projectId: string;
    loading?: boolean;
    error?: FetchError;
    hasVacancyText?: boolean;
  };
  const props = defineProps<Props>();

  const { data: fetchedFiles } = useNuxtData<ProjectFile[]>(`project-files-${props.projectId}`);

  const files = ref<File[]>([]);

  const { create, remove, loading: fileLoading } = useFile();

  const toast = useToast();

  const search = shallowRef('');
  const searchDebounced = refDebounced(search, 200);

  const items = computed(
    () =>
      fetchedFiles.value?.map((file) => ({
        id: file.id,
        title: file.filename,
        titleLower: file.filename.toLowerCase(),
        size: file.size,
        type: file.type,
        url: file.url,
      })) ?? [],
  );

  const displayedItems = computed(() => {
    const q = searchDebounced.value.trim().toLowerCase();

    if (!q) return items.value;

    return items.value.filter((item) => item.titleLower.includes(q));
  });

  const onChange = async (newFiles: File[] | null | undefined) => {
    if (!newFiles) return;

    const validFiles: File[] = [];

    for (const file of newFiles) {
      if (file.size > MAX_RESUME_FILE_SIZE) {
        toast.add({
          title: `Max file size exceeded - ${file.name}`,
          description: `Please, select only files not greater than ${formatFileSize(MAX_RESUME_FILE_SIZE)}`,
          color: 'error',
          avatar: {
            src: createObjectUrl(file),
            icon: 'i-lucide-file',
          },
        });
        continue;
      }

      if (!Object.values<string>(AvailableFileFormats).includes(file.type)) {
        toast.add({
          title: `Incorrect format - ${file.name}`,
          description: `Please, select only files with next formats - ${Object.keys(AvailableFileFormats).join(', ')}`,
          color: 'error',
          avatar: {
            src: createObjectUrl(file),
            icon: 'i-lucide-file',
          },
        });
        continue;
      }

      validFiles.push(file);
    }

    files.value = [...validFiles];

    try {
      const uploaded = await create(props.projectId, files.value);

      if (fetchedFiles.value) {
        fetchedFiles.value = [...fetchedFiles.value, ...(uploaded?.map((file) => ({ ...file })) ?? [])];
      }

      files.value = [];
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };

  const onDelete = async (fileId: string) => {
    try {
      const deleted = await remove(fileId);

      if (fetchedFiles.value) {
        fetchedFiles.value = fetchedFiles.value.filter((file) => file.id !== deleted?.id);
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
  <div class="flex flex-col gap-1">
    <UFileUpload
      v-model="files"
      multiple
      :disabled="hasVacancyText || loading || fileLoading"
      label="Click or drop your files"
      :description="`${Object.keys(AvailableFileFormats).join(', ')} (max ${MAX_RESUME_FILE_SIZE / 1024 ** 2}MB)`"
      size="lg"
      :accept="Object.values(AvailableFileFormats).join(',')"
      class="w-80"
      :icon="fileLoading ? 'i-lucide-loader' : 'i-lucide-upload'"
      :ui="{ files: 'block', icon: fileLoading ? 'animate-spin' : '' }"
      @update:model-value="(value) => onChange(value)"
    >
      <template #files>
        <div class="flex flex-col items-center justify-center text-center px-4 py-3">
          <span
            class="inline-flex items-center justify-center select-none rounded-full align-middle bg-elevated size-9 text-lg shrink-0"
          >
            <UIcon
              :name="fileLoading ? 'i-lucide-loader' : 'i-lucide-upload'"
              size="18"
              :class="{ 'animate-spin': fileLoading }"
            />
          </span>
          <p class="font-medium text-default mt-2">Click or drop your files</p>
          <p class="text-muted mt-1">
            {{ Object.keys(AvailableFileFormats).join(', ') }} (max {{ formatFileSize(MAX_RESUME_FILE_SIZE) }})
          </p>
        </div>
      </template>
    </UFileUpload>
    <p class="text-xs text-muted">AI can make mistakes. Please double-check responses.</p>
    <UInput v-model="search" icon="i-lucide-search" placeholder="Search candidates or files..." class="mb-1" />
    <div v-if="loading" class="h-20 flex flex-col items-center justify-center">
      <UIcon name="i-lucide-loader" size="30" class="animate-spin" />
    </div>
    <UScrollArea v-else v-slot="{ item }" :items="displayedItems" shadow virtualize class="h-full max-h-90">
      <UCard variant="soft" :ui="{ body: 'sm:p-2 group' }" class="bg-neutral-200 mb-2 relative">
        <div class="flex items-center gap-2">
          <NuxtImg v-if="item.type.includes('image/')" :src="item.url" alt="" width="20" height="20" class="shrink-0" />
          <UIcon v-else name="i-lucide-file" size="20" class="shrink-0" />
          <div>
            <p class="break-all">{{ item.title }}</p>
            <p class="text-muted text-xs">{{ formatFileSize(item.size) }}</p>
          </div>
        </div>
        <UButton
          size="xs"
          square
          variant="soft"
          color="error"
          loading-auto
          loading-icon="i-lucide-loader"
          icon="i-lucide-x"
          type="button"
          class="absolute top-0 right-0 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto"
          @click="onDelete(item.id)"
        />
      </UCard>
    </UScrollArea>
  </div>
</template>
