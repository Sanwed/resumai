<script lang="ts" setup>
  const route = useRoute();

  const backRoute = computed(() => route.meta.backRoute ?? '/');
</script>

<template>
  <UMain class="h-screen flex items-center justify-center px-4">
    <UButton
      icon="i-lucide-chevron-left"
      aria-label="Вернуться назад"
      :to="backRoute"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-8 top-8 rounded-full z-10"
    />

    <UPageCard variant="subtle" class="max-w-sm w-full">
      <slot />
    </UPageCard>
  </UMain>
</template>
