<script setup lang="ts">
  const colorMode = useColorMode();

  const color = computed(() => (colorMode.value === 'dark' ? '#020618' : 'white'));

  useHead({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { key: 'theme-color', name: 'theme-color', content: color },
    ],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: {
      lang: 'en',
    },
  });

  useSeoMeta({
    titleTemplate: '%s - ResumAI',
    description: 'Your best assistant with analysis of candidates resume and finding the best for you vacancy',
    twitterCard: 'summary_large_image',
    ogSiteName: 'ResumAI',
    robots: 'index, follow',
  });
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
