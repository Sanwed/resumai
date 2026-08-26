<script lang="ts" setup>
  import { AllowedFileFormats, MAX_RESUME_FILES_PER_UPLOAD, MAX_RESUME_FILE_SIZE } from '~/constants';
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

  type FileListItem = (typeof items.value)[number];
  const getFileActionLabel = (item: FileListItem) => {
    if (selectMode.value) {
      return `${selectedFileIds.value.includes(item.id) ? 'Deselect' : 'Select'} ${item.title}`;
    }

    return `Open analysis for ${item.title}`;
  };

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

    if (newFiles.length > MAX_RESUME_FILES_PER_UPLOAD) {
      toast.add({
        title: 'Too many files selected',
        description: `Upload no more than ${MAX_RESUME_FILES_PER_UPLOAD} resumes at once`,
        color: 'error',
      });
      files.value = [];
      return;
    }

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

      if (!Object.values<string>(AllowedFileFormats).includes(file.type)) {
        toast.add({
          title: `Incorrect format - ${file.name}`,
          description: `Please, select only files with next formats - ${Object.keys(AllowedFileFormats).join(', ')}`,
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

  const restart = async (fileIds: string[]) => {
    await createAnalysis(props.projectId, fileIds);
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
      :description="`${Object.keys(AllowedFileFormats).join(', ')} (max ${MAX_RESUME_FILE_SIZE / 1024 ** 2}MB each, ${MAX_RESUME_FILES_PER_UPLOAD} files)`"
      size="lg"
      :accept="Object.values(AllowedFileFormats).join(',')"
      :icon="fileLoading ? 'i-lucide-loader' : 'i-lucide-upload'"
      :aria-busy="fileLoading"
      :ui="{ root: 'w-full', files: 'block', icon: fileLoading ? 'animate-spin' : '' }"
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
              aria-hidden="true"
            />
          </span>
          <p class="font-medium text-default mt-2">Click or drop your files</p>
          <p class="text-muted mt-1">
            {{ Object.keys(AllowedFileFormats).join(', ') }} (max {{ formatFileSize(MAX_RESUME_FILE_SIZE) }} each,
            {{ MAX_RESUME_FILES_PER_UPLOAD }} files)
          </p>
        </div>
      </template>
    </UFileUpload>
    <span v-if="fileLoading" role="status" aria-live="polite" class="sr-only">Uploading candidate files</span>
    <p v-if="error" role="alert" class="text-sm text-red-800 dark:text-red-300">
      {{ error.statusMessage ?? 'Candidate files could not be loaded' }}
    </p>
    <p class="text-xs text-muted">AI can make mistakes. Please double-check responses.</p>
    <div class="flex flex-col gap-1 mb-1">
      <div class="flex items-center gap-2">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          aria-label="Search candidates or files"
          placeholder="Search candidates or files..."
          class="w-full"
        />
        <UButton
          :label="selectMode ? 'Cancel' : 'Select'"
          variant="soft"
          type="button"
          @click="toggleSelectMode(selectMode)"
        />
      </div>
      <div v-if="selectMode" class="flex items-center gap-2">
        <p role="status" aria-live="polite" class="text-muted text-sm mr-auto">
          {{ selectedFileIds.length }} {{ selectedFileIds.length === 1 ? 'file' : 'files' }} selected
        </p>
        <UButton
          v-if="!loading"
          variant="soft"
          color="secondary"
          icon="i-lucide-refresh-ccw"
          label="Restart analysis for selected files"
          loading-auto
          loading-icon="i-lucide-loader"
          size="xs"
          square
          type="button"
          :disabled="!selectedFileIds.length"
          :ui="{ label: 'sr-only' }"
          @click="restart(selectedFileIds)"
        />
        <UButton
          variant="soft"
          color="error"
          icon="i-lucide-trash-2"
          label="Delete selected files"
          loading-auto
          loading-icon="i-lucide-loader"
          size="xs"
          square
          type="button"
          :disabled="!selectedFileIds.length"
          :ui="{ label: 'sr-only' }"
          @click="deleteMany"
        />
      </div>
    </div>
    <div v-if="loading" role="status" aria-live="polite" class="h-20 flex flex-col items-center justify-center">
      <UIcon name="i-lucide-loader" size="30" class="animate-spin" aria-hidden="true" />
      <span class="sr-only">Loading candidate files</span>
    </div>
    <UScrollArea
      v-else
      v-slot="{ item }"
      :items="displayedItems"
      role="list"
      aria-label="Candidate files"
      shadow
      virtualize
      class="h-full max-h-90"
    >
      <UCard
        role="listitem"
        variant="soft"
        :ui="{
          root: [
            'group border border-2 border-transparent relative w-full text-left bg-neutral-200 mb-2 hover:bg-primary-100 active:bg-primary-200',
            item.active ? 'bg-primary-100 border-primary-500' : '',
            selectedFileIds.includes(item.id) ? 'bg-primary-200! border-primary-400' : '',
            item.status === 'succeed' ? 'bg-success-200 hover:bg-success-100 focus-visible:bg-success-100' : '',
            item.status === 'failed' || item.incomplete
              ? 'bg-error-200 hover:bg-error-100 focus-visible:bg-error-100'
              : '',
          ],
          body: 'p-2 sm:p-2 group',
        }"
      >
        <button
          type="button"
          class="absolute inset-0 z-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          :aria-label="getFileActionLabel(item)"
          :aria-pressed="selectMode ? selectedFileIds.includes(item.id) : undefined"
          :aria-current="!selectMode && item.active ? 'true' : undefined"
          @click="selectFile(item.id)"
        />

        <div class="relative z-1 flex items-center gap-2 pointer-events-none">
          <UProgress
            v-model="item.progress"
            animation="swing"
            :class="[
              'absolute -bottom-2 -left-2 w-[calc(100%+16px)] transition-opacity',
              { 'opacity-0': item.status === 'failed' || item.status === 'succeed' },
            ]"
            size="sm"
            :aria-label="`Analysis progress for ${item.title}`"
            :aria-valuetext="`${Math.round(item.progress)}% complete`"
          />
          <NuxtImg v-if="item.type.includes('image/')" :src="item.url" alt="" width="20" height="20" class="shrink-0" />
          <UIcon v-else name="i-lucide-file" size="20" class="shrink-0" />
          <div>
            <p class="break-all">{{ item.title }}</p>
            <p class="text-muted text-xs">{{ formatFileSize(item.size) }}</p>
          </div>
        </div>
        <UBadge
          v-if="item.rate"
          :label="`${item.rate}% match`"
          variant="soft"
          class="absolute bottom-0 right-0 pointer-events-none"
        />

        <div class="absolute z-10 top-0 right-0 flex items-center gap-1">
          <UButton
            size="xs"
            square
            variant="soft"
            color="secondary"
            loading-auto
            loading-icon="i-lucide-loader"
            icon="i-lucide-refresh-ccw"
            :label="`Restart analysis for ${item.title}`"
            type="button"
            :ui="{ label: 'sr-only' }"
            class="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-hover:pointer-events-auto focus-visible:pointer-events-auto"
            @click.prevent.stop="restart([item.id])"
          />

          <UButton
            size="xs"
            square
            variant="soft"
            color="error"
            loading-auto
            loading-icon="i-lucide-loader"
            icon="i-lucide-x"
            :label="`Delete ${item.title}`"
            type="button"
            :ui="{ label: 'sr-only' }"
            class="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 group-hover:pointer-events-auto focus-visible:pointer-events-auto"
            @click.prevent.stop="onDelete(item.id)"
          />
        </div>
      </UCard>
    </UScrollArea>
  </div>
</template>
