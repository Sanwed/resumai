<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import z from 'zod';
  import { MIN_PASSWORD_LENGTH } from '~/constants';
  import { authClient } from '~/lib/auth-client';

  useSeoMeta({
    title: 'Set a New Password',
    robots: 'noindex, nofollow',
    description:
      'Set a new password for your ResumAI account, restore secure access, and return to your resume analysis projects, candidate reports, and settings.',
  });

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
      autocomplete: 'new-password',
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
      const { error } = await authClient.resetPassword({
        newPassword: payload.data.password,
        token,
      });

      if (error) {
        handleApiError(error, toast);
        return;
      }

      await navigateTo({ path: '/login', query: { 'message-success': 'Password successfully changed' } });
    } catch (error) {
      handleApiError(error, toast);
    }
  }
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-rotate-ccw"
    @submit="onSubmit"
  >
    <template #title>
      <h1>Reset password</h1>
    </template>
    <template #description>Create new password</template>
  </UAuthForm>
</template>
