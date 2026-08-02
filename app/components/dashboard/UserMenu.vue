<script lang="ts" setup>
  import type { DropdownMenuItem } from '@nuxt/ui';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    collapsed?: boolean;
  };
  defineProps<Props>();

  const { data: session } = await authClient.useSession(useAuthFetch);

  const items = computed<DropdownMenuItem[][]>(() => [
    [
      {
        type: 'label',
        label: session.value?.user.name,
        avatar: { src: session.value?.user.image ?? undefined },
      },
    ],
    [
      {
        label: 'Profile',
        icon: 'i-lucide-user',
      },
      {
        label: 'Billing',
        icon: 'i-lucide-credit-card',
      },
      {
        label: 'Home',
        icon: 'i-lucide-house',
        to: '/',
      },
    ],
    [
      {
        label: 'GitHub',
        icon: 'i-simple-icons-github',
        to: 'https://github.com/Sanwed/resumai',
        target: '_blank',
      },
      {
        label: 'LinkedIn',
        icon: 'i-simple-icons-linkedin',
        to: 'https://www.linkedin.com/in/sanwed',
        target: '_blank',
      },
    ],
    [
      {
        label: 'Log out',
        icon: 'i-lucide-log-out',
        color: 'error',
      },
    ],
  ]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :avatar="{ src: session?.user.image ?? undefined }"
      :label="collapsed ? undefined : session?.user.name"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
