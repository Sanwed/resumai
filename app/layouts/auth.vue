<script lang="ts" setup>
  const route = useRoute();

  const backRoute = computed(() => route.meta.backRoute ?? '/');
</script>

<template>
  <UMain id="main-content" tabindex="-1" class="h-screen flex p-4">
    <UButton
      icon="i-lucide-chevron-left"
      label="Go back"
      :to="backRoute"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-4 top-4 md:left-8 md:top-8 rounded-full z-10"
      :ui="{ label: 'sr-only' }"
    />

    <UPageCard variant="subtle" class="max-w-sm w-full m-auto">
      <slot />
    </UPageCard>
  </UMain>
</template>
