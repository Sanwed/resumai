<script lang="ts" setup>
  import { AvailableFileFormats, MAX_RESUME_FILE_SIZE } from '~/constants';
  import type { Analysis, ProjectFile } from '~/generated/prisma/client';
  import type { FetchError } from 'ofetch';

  type Props = {
    projectId: string;
    loading?: boolean;
    error?: FetchError;
    hasVacancyText?: boolean;
  };
  const props = defineProps<Props>();

  const { data: fetchedFiles } = useNuxtData<ProjectFile[]>(`project-files-${props.projectId}`);
  const { data: analyses } = useNuxtData<Analysis[]>(`project-analysis-${props.projectId}`);

  const files = ref<File[]>([]);

  const { create, removeOne, removeMany, loading: fileLoading, selectedFileId } = useFile(props.projectId);
  const { create: createAnalysis } = useAnalysis();

  const toast = useToast();

  const search = shallowRef('');
  const searchDebounced = refDebounced(search, 200);

  const items = computed(
    () =>
      fetchedFiles.value?.map((file) => {
        const analysis = analyses.value?.find((an) => an.fileId === file.id);

        return {
          id: file.id,
          title: analysis?.fileId === file.id && analysis.candidateName ? analysis.candidateName : file.filename,
          size: file.size,
          type: file.type,
          url: file.url,
          active: file.id === selectedFileId.value,
          progress: analysis?.progress ?? 0,
          incomplete: analysis?.incomplete,
          status: analysis?.status,
          rate: analysis?.fileId === file.id ? analysis.compatibility : undefined,
        };
      }) ?? [],
  );

  const displayedItems = computed(() => {
    const q = searchDebounced.value.trim().toLowerCase();

    const filtered = q ? items.value.filter((item) => item.title?.toLowerCase().includes(q)) : [...items.value];

    return filtered.sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
  });

  const selectMode = ref(false);
  const selectedFileIds = ref<string[]>([]);

  const selectFile = (fileId: string) => {
    if (!selectMode.value) {
      selectedFileId.value = fileId;
      return;
    }

    const existingId = selectedFileIds.value.findIndex((id) => fileId === id);
    if (existingId !== -1) {
      selectedFileIds.value.splice(existingId, 1);
    } else {
      selectedFileIds.value.push(fileId);
    }
  };

  const toggleSelectMode = (active: boolean) => {
    if (active) {
      selectMode.value = false;
      selectedFileIds.value = [];
    } else {
      selectMode.value = true;
    }
  };

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
      const uploaded = await create(files.value);

      if (fetchedFiles.value && uploaded) {
        fetchedFiles.value = [...fetchedFiles.value, ...uploaded];
      }

      if (uploaded) {
        await createAnalysis(
          props.projectId,
          uploaded.map((file) => file.id),
        );
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

  const deleteMany = async () => {
    try {
      const deleted = await removeMany(selectedFileIds.value);

      if (fetchedFiles.value) {
        fetchedFiles.value = fetchedFiles.value.filter((file) => !deleted?.includes(file.id));
      }

      selectedFileIds.value = [];
      selectMode.value = false;
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
      const deleted = await removeOne(fileId);

      if (fetchedFiles.value) {
        fetchedFiles.value = fetchedFiles.value.filter((file) => file.id !== deleted?.id);
      }

      selectedFileId.value = undefined;
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
    <div class="flex flex-col gap-1 mb-1">
      <div class="flex items-center gap-2">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search candidates or files..." class="w-full" />
        <UButton
          :label="selectMode ? 'Cancel' : 'Select'"
          variant="soft"
          type="button"
          @click="toggleSelectMode(selectMode)"
        />
      </div>
      <div v-if="selectMode" class="flex items-center gap-2">
        <p class="text-muted text-sm mr-auto">{{ selectedFileIds.length }} files</p>
        <UButton
          variant="soft"
          color="error"
          icon="i-lucide-trash-2"
          loading-auto
          loading-icon="i-lucide-loader"
          size="xs"
          square
          type="button"
          aria-label="Delete selected files"
          @click="deleteMany"
        />
      </div>
    </div>
    <div v-if="loading" class="h-20 flex flex-col items-center justify-center">
      <UIcon name="i-lucide-loader" size="30" class="animate-spin" />
    </div>
    <UScrollArea v-else v-slot="{ item }" :items="displayedItems" shadow virtualize class="h-full max-h-90">
      <UCard
        as="button"
        type="button"
        variant="soft"
        :ui="{
          root: [
            'border border-2 border-transparent relative w-full text-left bg-neutral-200 mb-2 relative hover:bg-primary-100 focus-visible:bg-primary-100 focus-visible:outline-0 active:bg-primary-200',
            item.active ? 'bg-primary-100 border-primary-500' : '',
            selectedFileIds.includes(item.id) ? 'bg-primary-200! border-primary-400' : '',
            item.status === 'succeed' ? 'bg-success-200 hover:bg-success-100 focus-visible:bg-success-100' : '',
            item.status === 'failed' || item.incomplete
              ? 'bg-error-200 hover:bg-error-100 focus-visible:bg-error-100'
              : '',
          ],
          body: 'sm:p-2 group',
        }"
        @click="selectFile(item.id)"
      >
        <div class="flex items-center gap-2">
          <UProgress
            v-model="item.progress"
            animation="swing"
            :class="[
              'absolute bottom-0 left-0 right-0 transition-opacity',
              { 'opacity-0': item.status === 'failed' || item.status === 'succeed' },
            ]"
            size="sm"
          />
          <NuxtImg v-if="item.type.includes('image/')" :src="item.url" alt="" width="20" height="20" class="shrink-0" />
          <UIcon v-else name="i-lucide-file" size="20" class="shrink-0" />
          <div>
            <p class="break-all">{{ item.title }}</p>
            <p class="text-muted text-xs">{{ formatFileSize(item.size) }}</p>
          </div>
        </div>
        <UBadge v-if="item.rate" :label="item.rate" variant="soft" class="absolute bottom-0 right-0" />

        <UButton
          size="xs"
          square
          variant="soft"
          color="error"
          loading-auto
          loading-icon="i-lucide-loader"
          icon="i-lucide-x"
          type="button"
          class="absolute top-0 right-0 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-hover:pointer-events-auto focus-visible:pointer-events-auto"
          @click.prevent.stop="onDelete(item.id)"
        />
      </UCard>
    </UScrollArea>
  </div>
</template>
