<script lang="ts" setup>
  import { Providers } from '~/constants';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    defaultMail?: string;
  };
  const props = defineProps<Props>();

  const toast = useToast();

  const linkedAccounts = ref<{ id: string; providerId: string }[]>([]);

  const fetchLinkedAccounts = async () => {
    const { data, error } = await authClient.listAccounts();

    if (error) {
      handleApiError(error, toast);
      return;
    }

    linkedAccounts.value = data ?? [];
  };

  await fetchLinkedAccounts();

  const isProviderConnected = (providerId: string) =>
    new Set(linkedAccounts.value?.map((ac) => ac.providerId)).has(providerId);

  const loginMethods = computed(() => [
    {
      id: Providers.CREDENTIAL,
      description: props.defaultMail,
      name: 'Email',
      icon: 'i-lucide-mail',
    },
    {
      id: Providers.GITHUB,
      name: 'GitHub',
      icon: 'i-simple-icons-github',
      description: isProviderConnected(Providers.GITHUB)
        ? 'You have already linked your GitHub account'
        : 'Link your GitHub account',
      connected: isProviderConnected(Providers.GITHUB),
    },
    {
      id: Providers.GOOGLE,
      name: 'Google',
      icon: 'i-simple-icons-google',
      description: isProviderConnected(Providers.GOOGLE)
        ? 'You have already linked your Google account'
        : 'Link your Google account',
      connected: isProviderConnected(Providers.GOOGLE),
    },
    {
      id: Providers.LINKEDIN,
      name: 'LinkedIn',
      icon: 'i-simple-icons-linkedin',
      description: isProviderConnected(Providers.LINKEDIN)
        ? 'You have already linked your LinkedIn account'
        : 'Link your LinkedIn account',
      connected: isProviderConnected(Providers.LINKEDIN),
    },
  ]);

  const connectProvider = async (providerId: string) => {
    try {
      const { error } = await authClient.linkSocial({ provider: providerId, callbackURL: '/profile' });

      if (error) handleApiError(error, toast);
    } catch (e) {
      handleApiError(e, toast);
    }
  };

  const unlinkProvider = async (providerId: string) => {
    try {
      const account = linkedAccounts.value.find((linkedAccount) => linkedAccount.providerId === providerId);
      if (!account) return;

      const { error } = await authClient.unlinkAccount({ accountId: account.id });

      if (error) {
        handleApiError(error, toast);
        return;
      }

      await fetchLinkedAccounts();
    } catch (e) {
      handleApiError(e, toast);
    }
  };
</script>

<template>
  <UPageCard title="Sign-in Methods" description="Customize how you access your account">
    <ul>
      <li v-for="(method, index) in loginMethods" :key="index">
        <USeparator />
        <div class="my-3 flex gap-3 items-center">
          <UIcon :name="method.icon" size="30" class="shrink-0" />
          <div class="flex flex-col">
            <p class="font-medium text-base">{{ method.name }}</p>
            <p class="text-muted text-xs">{{ method.description }}</p>
          </div>
          <template v-if="method.id !== Providers.CREDENTIAL">
            <UButton
              v-if="method.connected"
              variant="soft"
              color="error"
              label="Unlink"
              class="ml-auto"
              @click="unlinkProvider(method.id)"
            />
            <UButton v-else variant="soft" label="Connect" class="ml-auto" @click="connectProvider(method.id)" />
          </template>
        </div>
      </li>
    </ul>
  </UPageCard>
</template>
