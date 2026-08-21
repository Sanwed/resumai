<script lang="ts" setup>
  import type { CommandPaletteItem } from '@nuxt/ui';

  const [{ data: projects, pending: loading, error }, { pending: notificationsLoading, error: notificationsError }] =
    await Promise.all([
      useLazyFetch('/api/project', { key: 'projects' }),
      useLazyFetch('/api/notification', {
        key: 'notifications',
        query: { read: false },
      }),
    ]);

  const sidebarOpen = ref(false);

  const links = computed<CommandPaletteItem[]>(() => [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/',
      onSelect: () => {
        sidebarOpen.value = false;
      },
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card',
      to: '/billing',
      onSelect: () => {
        sidebarOpen.value = false;
      },
    },
    {
      label: 'Profile',
      icon: 'i-lucide-settings',
      to: '/profile',
      onSelect: () => {
        sidebarOpen.value = false;
      },
    },
  ]);

  const projectLinks = computed(
    () =>
      projects.value?.map((project) => ({
        label: project.name,
        icon: 'i-lucide-folder',
        to: `/dashboard/${project.id}`,
        onSelect: () => {
          sidebarOpen.value = false;
        },
      })) ?? [],
  );

  const groups = computed(() => [
    {
      id: 'projects',
      label: 'Projects',
      items: projectLinks.value,
    },
    {
      id: 'links',
      label: 'Go to',
      items: links.value,
    },
  ]);
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar v-model:open="sidebarOpen" collapsible :default-size="20">
      <template #header="{ collapsed }">
        <NuxtLink
          to="/dashboard"
          aria-label="ResumAI dashboard"
          class="hover:text-primary focus-visible:text-primary transition-colors"
        >
          <AppLogo :collapsed="collapsed" aria-hidden="true" class="h-10 max-w-full" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <DashboardProjectNavigation :collapsed="collapsed" :loading="loading" :error="error" />
      </template>

      <template #footer="{ collapsed }">
        <DashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" shortcut="meta_k" :fuse="{ resultLimit: 42 }" />

    <NotificationSlideover :loading="notificationsLoading" :error="notificationsError" />

    <slot />
  </UDashboardGroup>
</template>
