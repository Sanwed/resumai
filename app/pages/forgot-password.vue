<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import * as z from 'zod';
  import { authClient } from '~/lib/auth-client';

  definePageMeta({
    layout: 'auth',
    backRoute: '/login',
  });

  const toast = useToast();
  const sent = ref(false);

  const fields = [
    {
      name: 'email',
      type: 'text' as const,
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
        redirectTo: 'http://localhost:3000/reset-password/',
        fetchOptions: {
          onError: (error) => {
            toast.add({
              description: error.error.message,
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
    title="Forgot your password?"
    :submit="{ label: 'Get reset link' }"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-rotate-ccw"
    @submit="onSubmit"
  >
    <template #description>You will receive a link to reset your password</template>
    <template #validation>
      <UAlert v-if="sent" title="Link was sent to your email" color="success" variant="soft" />
    </template>
  </UAuthForm>
</template>
