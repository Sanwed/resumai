<script setup lang="ts"></script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <a href="#main-content" class="skip-link">Skip to main content</a>

    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
