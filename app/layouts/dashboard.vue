<script setup lang="ts">

</script>

<template>
  <div>
    <header class="sticky top-0 flex items-center gap-4 p-4 md:px-8 bg-white border-b border-primary/50">
      <ULink to="/overview">
        <NuxtImg class="w-28" src="/logo.png" alt="Логотип ResumAI" />
      </ULink>
      <UModal>
        <UButton :label="$viewport.isGreaterOrEquals('tablet') ? 'Начните искать' : undefined" color="neutral"
          :variant="$viewport.isGreaterOrEquals('tablet') ? 'subtle' : 'soft'" size="lg"
          class="ml-auto rounded-full md:mx-auto md:min-w-sm" icon="i-lucide-search" />

        <template #content>
          <UCommandPalette placeholder="Введите название проекта или команды">
            <template #empty>
              <div class="flex items-center gap-2 px-2.5 justify-center">
                <UIcon name="i-bx-box" />
                <p>Ничего не найдено</p>
              </div>
            </template>
          </UCommandPalette>
        </template>
      </UModal>
      <UserMenu />
    </header>
    <slot />
  </div>
</template>