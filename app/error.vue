<script setup lang="ts">
  import type { NuxtError } from '#app';

  type Props = {
    error: NuxtError;
  };

  defineProps<Props>();

  useSeoMeta({
    title: 'Page not found',
    description: 'We are sorry but this page could not be found.',
  });
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

    <UToaster />
  </div>
</template>
