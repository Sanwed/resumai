<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import z from 'zod';
  import { MIN_PASSWORD_LENGTH } from '~/constants';
  import { authClient } from '~/lib/auth-client';

  const route = useRoute();
  const token = route.query.token as string | undefined;

  if (!token) {
    navigateTo('/login');
  }

  const toast = useToast();

  definePageMeta({
    layout: 'auth',
    backRoute: '/login',
  });

  const fields = [
    {
      name: 'password',
      type: 'password' as const,
      label: 'Password',
      placeholder: 'Enter new password',
      required: true,
    },
  ];

  const schema = z.object({
    password: z
      .string({ error: 'Password required' })
      .min(MIN_PASSWORD_LENGTH, `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`),
  });

  type Schema = z.output<typeof schema>;

  async function onSubmit(payload: FormSubmitEvent<Schema>) {
    try {
      await authClient.resetPassword({
        newPassword: payload.data.password,
        token,
        fetchOptions: {
          onSuccess: () => {
            navigateTo({ path: '/login', query: { 'message-success': 'Password successfully changed' } });
          },
        },
      });
    } catch (error) {
      handleApiError(error, toast);
    }
  }
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Reset password"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-rotate-ccw"
    @submit="onSubmit"
  >
    <template #description>Create new password</template>
  </UAuthForm>
</template>
