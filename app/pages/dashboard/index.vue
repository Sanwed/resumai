<script lang="ts" setup>
  import type { Notification } from '~/generated/prisma/client';

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  const { data: notifications } = useNuxtData<Notification[]>('notifications');

  const { open } = useNotification();

  useSeoMeta({
    title: 'Dashboard',
    ogTitle: 'Dashboard',
    description:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
    ogDescription:
      'Manage your recruitment projects, analyze resumes, compare candidates, and review AI-powered hiring insights.',
  });

  const unreadNotifications = computed(() => notifications.value?.filter((n) => !n.read) ?? []);
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ root: 'sm:px-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton color="neutral" variant="ghost" square aria-label="Notifications" @click="open = true">
            <UChip color="error" :show="unreadNotifications.length != 0" inset>
              <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
            </UChip>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="size-full flex items-center justify-center">
        <p class="text-lg">Create or choose existing project on the sidebar</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
