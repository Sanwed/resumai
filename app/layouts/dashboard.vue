<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import type { Project } from '~/generated/prisma/client';

  const sidebarOpen = ref(false);

  const { data: projects } = useNuxtData<Project[]>('projects');

  const links = [
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
    {
      label: 'Feedback',
      icon: 'i-lucide-message-circle',
      to: 'https://github.com/nuxt-ui-templates/dashboard',
      target: '_blank',
    },
    {
      label: 'Help & Support',
      icon: 'i-lucide-info',
      to: 'https://github.com/nuxt-ui-templates/dashboard',
      target: '_blank',
    },
  ] satisfies NavigationMenuItem[];

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
      items: links,
    },
  ]);
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar v-model:open="sidebarOpen" collapsible :default-size="20">
      <template #header="{ collapsed }">
        <NuxtLink to="/dashboard" class="hover:text-primary focus-visible:text-primary transition-colors">
          <AppLogo :collapsed="collapsed" class="h-10 max-w-full" />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <DashboardProjectNavigation :collapsed="collapsed" />
      </template>

      <template #footer="{ collapsed }">
        <DashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" shortcut="meta_k" :fuse="{ resultLimit: 42 }" />

    <slot />
  </UDashboardGroup>
</template>
