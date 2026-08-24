<script lang="ts" setup>
  import type { Notification } from '~/generated/prisma/client';
  import { authClient } from '~/lib/auth-client';

  useSeoMeta({
    title: 'Dashboard',
    robots: 'noindex, nofollow',
    description:
      'Access your ResumAI dashboard to create hiring projects, upload resumes, manage candidate analyses, and easily review AI-powered matching reports.',
  });

  definePageMeta({ layout: 'dashboard', middleware: 'auth' });

  const { data: notifications } = useNuxtData<Notification[]>('notifications');
  const { data: session } = await authClient.useSession(useAuthFetch);

  const { open } = useNotification();

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
          <UButton
            to="/billing"
            variant="soft"
            color="primary"
            block
            :label="`${session?.user.tokens ?? 0} tokens`"
            icon="i-lucide-coins"
            class="justify-center"
          />
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
