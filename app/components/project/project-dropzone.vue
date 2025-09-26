<script lang="ts" setup>
import { useDropZone } from '@vueuse/core';
import { AllowedFileTypes, MAX_FILES_COUNT } from '~/constants';

const dropZoneRef = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();
const filesData = ref<File[]>([]);

const onDrop = (files: File[] | null) => {
  if (files && files.length > 0) {
    filesData.value = [...files, ...filesData.value];
  }
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    filesData.value = [...target.files, ...filesData.value,];
    console.log(filesData.value);
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: Object.values(AllowedFileTypes),
  multiple: true,
});

const getFileName = (file: File) => {
  const dotIndex = file.name.lastIndexOf('.');

  const fileName = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
  const fileExt = dotIndex !== -1 ? file.name.slice(dotIndex) : '';

  if (fileName && fileName.length > 50) {
    const firstPart = fileName.slice(0, 15);
    const secondPart = fileName.slice(-15);

    return `${firstPart}...${secondPart}.${fileExt}`;
  }

  return file.name;
}

const deleteFile = (file: File) => {
  const index = filesData.value.findIndex(item => item === file);

  if (index !== -1) {
    filesData.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="flex flex-col gap-y-6">
    <button ref="dropZoneRef" type="button" :class="['cursor-pointer rounded-xl border-4 border-dashed border-primary-200 h-30 p-2 w-full flex flex-col items-center justify-center hover:bg-slate-100 hover:border-primary-300 focus-visible:bg-slate-100 focus-visible:outline-0 focus-visible:border-primary-300', {
      'bg-slate-100 border-primary-300': isOverDropZone,
    }]" @click="fileInputRef?.click()">
      <p v-if="isOverDropZone" class="md:text-xl text-center">Отпустите файл здесь</p>
      <p v-else class="md:text-xl text-center">Перетащите файл или нажмите для выбора</p>
      <p class="text-sm md:text-base text-center text-primary">Разрешенные форматы: {{ Object.keys(AllowedFileTypes).join(', ') }}</p>
      <p class="text-sm md:text-base text-center text-primary">Максимум до {{ MAX_FILES_COUNT }} {{ pluralize(MAX_FILES_COUNT, ['файла', 'файлов', 'файлов']) }}</p>
    </button>
    <input ref="fileInputRef" class="hidden" type="file" accept=".pdf,.doc,.docx" multiple @change="onFileChange">
    <ul v-if="filesData && filesData.length !== 0" class="flex flex-col gap-y-2">
      <li v-for="file in filesData" :key="file.lastModified" class="flex items-center gap-x-2">
        <UIcon v-if="file.type === AllowedFileTypes.PDF" name="i-fluent-document-pdf-24-filled"
          class="size-6 text-primary" />
        <UIcon v-if="file.type === AllowedFileTypes.DOC || file.type === AllowedFileTypes.DOCX"
          name="i-material-symbols-light-docs-rounded" class="size-6 text-primary" />
        <p>{{ getFileName(file) }}</p>
        <UButton icon="i-lucide-x" variant="outline" class="ml-auto size-8 items-center justify-center"
          aria-label="Удалить файл" @click="deleteFile(file)" />
      </li>
    </ul>
  </div>
</template>