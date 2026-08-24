<script setup lang="ts">
  import type { NuxtError } from '#app';

  type Props = {
    error: NuxtError;
  };

  defineProps<Props>();

  useSeoMeta({
    title: 'Page not found',
    robots: 'noindex, nofollow',
    description:
      'The page you requested could not be found. Check the web address or return to ResumAI to continue analyzing resumes and managing hiring projects.',
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
