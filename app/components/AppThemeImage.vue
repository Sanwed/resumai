<script setup lang="ts">
  defineProps<{
    src?: string;
    darkSrc?: string;
    alt: string;
    width: string | number;
    height: string | number;
    sizes: string;
    preload?: boolean;
  }>();

  const colorMode = useColorMode();

  const darkSourceMedia = computed(() => (colorMode.value === 'dark' ? 'all' : 'not all'));
</script>

<template>
  <picture class="block">
    <source :media="darkSourceMedia" :srcset="darkSrc" :sizes="sizes" />
    <NuxtImg :src="src" :alt="alt" :width="width" :height="height" :sizes="sizes" :preload="preload" class="w-full" />
  </picture>
</template>
