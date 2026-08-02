<script lang="ts" setup>
  const open = ref(false);
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar v-model:open="open" collapsible :default-size="20">
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

    <slot />
  </UDashboardGroup>
</template>
