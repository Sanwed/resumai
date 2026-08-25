<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import z from 'zod';
  import { authClient } from '~/lib/auth-client';

  definePageMeta({
    layout: 'auth',
    backRoute: '/login',
  });

  useSeoMeta({
    title: 'Reset Your Password',
    robots: 'noindex, nofollow',
    description:
      'Request a secure password reset link for your ResumAI account and quickly restore access to your resume analysis projects, reports, and settings.',
  });

  const toast = useToast();
  const sent = ref(false);
  const resetPasswordURL = new URL('/reset-password', useRequestURL().origin).toString();

  const fields = [
    {
      name: 'email',
      type: 'email' as const,
      autocomplete: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      required: true,
    },
  ];

  const schema = z.object({
    email: z.email('Invalid email'),
  });

  type Schema = z.output<typeof schema>;

  async function onSubmit(payload: FormSubmitEvent<Schema>) {
    try {
      await authClient.requestPasswordReset({
        email: payload.data.email,
        redirectTo: resetPasswordURL,
        fetchOptions: {
          onError: (event) => {
            toast.add({
              description: event.error.message,
              icon: 'i-lucide-circle-x',
              color: 'error',
            });
          },
        },
      });
      sent.value = true;
    } catch (error) {
      handleApiError(error, toast);
    }
  }
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :submit="{ label: 'Get reset link' }"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-rotate-ccw"
    @submit="onSubmit"
  >
    <template #title>
      <h1>Forgot your password?</h1>
    </template>
    <template #description>You will receive a link to reset your password</template>
    <template #validation>
      <UAlert
        v-if="sent"
        role="status"
        aria-live="polite"
        title="Link was sent to your email"
        color="success"
        variant="soft"
      />
    </template>
  </UAuthForm>
</template>
