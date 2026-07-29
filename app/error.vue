<script setup lang="ts">
  import type { NuxtError } from '#app';

  type Props = {
    error: NuxtError;
  };

  defineProps<Props>();

  useHead({
    htmlAttrs: {
      lang: 'en',
    },
  });

  useSeoMeta({
    title: 'Page not found',
    description: 'We are sorry but this page could not be found.',
  });

  const links = [
    {
      label: 'Pricing',
      icon: 'i-lucide-credit-card',
      to: '/pricing',
    },
    {
      label: 'Blog',
      icon: 'i-lucide-pencil',
      to: '/blog',
    },
  ];
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch shortcut="meta_k" :links="links" :fuse="{ resultLimit: 42 }" />
    </ClientOnly>

    <UToaster />
  </div>
</template>
