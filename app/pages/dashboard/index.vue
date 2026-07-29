<script lang="ts" setup>
  import { authClient } from '~/lib/auth-client';

  definePageMeta({ middleware: 'auth' });

  const { data: session } = await authClient.useSession(useAuthFetch);

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
  <div>
    <UButton label="Logout" @click="logout" />
  </div>
</template>
