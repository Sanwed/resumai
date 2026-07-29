<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui';

  const items: NavigationMenuItem[] = [
    {
      label: 'Privacy Policy',
      to: '/privacy',
    },
    {
      label: 'Terms of Service',
      to: '/terms',
    },
    {
      label: 'Cookie Policy',
      to: '/cookies',
    },
  ];
</script>

<template>
  <USeparator />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #left>
      <p class="text-muted text-sm">ResumAI • © {{ new Date().getFullYear() }}</p>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton
        to="https://www.linkedin.com/in/sanwed/"
        target="_blank"
        icon="i-simple-icons-linkedin"
        aria-label="ResumAI on LinkedIn"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://github.com/Sanwed/resumai"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="ResumAI on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
