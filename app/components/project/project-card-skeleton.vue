<template>
  <UCard :ui="{
    root: 'w-sm block ring-transparent',
    header: 'border-none p-4 sm:px-4',
    body: 'sm:p-4',
    footer: 'sm:p-4',
  }">
    <template #header>
      <div class="flex items-center justify-between">
        <USkeleton class="h-6 w-24" />
        <USkeleton class="h-6 w-24" />
      </div>
    </template>

    <div class="flex items-start gap-x-4">
      <div class="shrink-0 size-10 rounded-sm bg-primary-50 border border-primary-200 flex justify-center items-center">
        <UIcon name="i-material-symbols-image" class="size-8 text-primary/50" />
      </div>
      <USkeleton class="h-5 w-full" />
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <USkeleton class="h-5 w-24 ml-auto" />
      </div>
    </template>
  </UCard>
</template>