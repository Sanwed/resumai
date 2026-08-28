<script lang="ts" setup>
  import type { DropdownMenuItem } from '@nuxt/ui';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    collapsed?: boolean;
  };
  defineProps<Props>();

  const toast = useToast();
  const session = authClient.useSession();

  const { data: avatarBlob } = await useFetch<Blob>('/api/avatar', {
    responseType: 'blob',
    credentials: 'include',
    server: false,
  });

  const avatarSrc = computed(() => {
    if (!avatarBlob.value) return;

    return URL.createObjectURL(avatarBlob.value);
  });

  const items = computed<DropdownMenuItem[][]>(() => [
    [
      {
        type: 'label',
        label: session.value.data?.user.name,
        avatar: {
          src: avatarSrc.value ?? '/avatar-placeholder.png',
          alt: session.value.data?.user.name ?? 'Account avatar',
        },
      },
    ],
    [
      {
        label: 'Profile',
        icon: 'i-lucide-settings',
        to: '/profile',
      },
      {
        label: 'Billing',
        icon: 'i-lucide-credit-card',
        to: '/billing',
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
        onSelect: async () => {
          const { error } = await authClient.signOut();

          if (error) {
            handleApiError(error, toast);
            return;
          }

          await navigateTo('/login', { external: true, replace: true });
        },
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
      :avatar="{
        src: avatarSrc ?? '/avatar-placeholder.png',
        alt: session.data?.user.name ?? 'Account avatar',
      }"
      :label="collapsed ? 'Open user menu' : session.data?.user.name"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        label: collapsed ? 'sr-only' : undefined,
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
