<script lang="ts" setup>
  import { authClient } from '~/lib/auth-client';

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  useSeoMeta({
    title: 'Dashboard',
    ogTitle: 'Dashboard',
    description:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
    ogDescription:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
  });

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigateTo('/login');
        },
      },
    });
  };
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body> Dashboard </template>
  </UDashboardPanel>
</template>
