<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui';
import { authClient } from '~/lib/auth-client';

const session = authClient.useSession();

const links = ref<NavigationMenuItem[]>([
  {
    label: 'Мои проекты',
    icon: 'i-lucide-briefcase-business',
    to: '/overview',
  },
  {
    label: 'Профиль',
    icon: 'i-lucide-user',
    to: '/profile',
  },
  {
    label: 'Главная страница',
    icon: 'i-lucide-house',
    to: '/',
  },
]);

const onSignOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        navigateTo('/auth/login');
      }
    }
  })
}
</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="ghost" class="flex items-center justify-center size-9 rounded-full p-0">
      <NuxtImg v-if="session.data?.user.image" :src="session.data.user.image" alt="Меню профиля" class="rounded-full" />
      <UIcon v-else name="i-material-symbols-account-circle" class="size-6" />
    </UButton>

    <template #content>
      <div class=" min-w-60 p-2 flex flex-col gap-y-2">
        <div>
          <p class="font-medium">{{ session.data?.user.name }}</p>
          <p class="text-sm font-medium text-muted">{{ session.data?.user.email }}</p>
        </div>
        <UNavigationMenu orientation="vertical" :items="links" />
        <div class="pt-2 border-t border-primary/20">
          <UButton variant="ghost" leading-icon="i-lucide-log-out" class="w-full" @click="onSignOut">
            Выйти
          </UButton>
        </div>
        <div class="pt-2 border-t border-primary/20">
          <UButton to="/upgrade" leading-icon="i-material-symbols-star" class="w-full justify-center">
            Обновить план
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>