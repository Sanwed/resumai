<script setup lang="ts">
  import * as z from 'zod';
  import type { FormSubmitEvent } from '@nuxt/ui';
  import { authClient } from '~/lib/auth-client';

  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Login',
    description: 'Login to your account to continue',
  });

  const toast = useToast();

  const fields = [
    {
      name: 'email',
      type: 'text' as const,
      label: 'Email',
      placeholder: 'Enter your email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: 'Enter your password',
      required: true,
    },
    {
      name: 'remember',
      label: 'Remember me',
      type: 'checkbox' as const,
    },
  ];

  const providers = [
    {
      icon: 'i-simple-icons-github',
      square: true,
      'aria-label': 'Sign in by GitHub',
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
      },
      onClick: async () => {
        try {
          await signInWithProvider('github');
        } catch (error) {
          handleApiError(error, toast);
        }
      },
    },
    {
      icon: 'i-simple-icons-google',
      square: true,
      'aria-label': 'Sign in by GitHub',
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
      },
      onClick: async () => {
        try {
          await signInWithProvider('github');
        } catch (error) {
          handleApiError(error, toast);
        }
      },
    },
    {
      icon: 'i-simple-icons-linkedin',
      square: true,
      'aria-label': 'Sign in by LinkedIn',
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
      },
      onClick: async () => {
        try {
          await signInWithProvider('linkedin');
        } catch (error) {
          handleApiError(error, toast);
        }
      },
    },
  ];

  const schema = z.object({
    email: z.email('Invalid email'),
    password: z.string({ error: 'Password required' }).min(1, 'Password required'),
    rememberMe: z.boolean().optional(),
  });

  type Schema = z.output<typeof schema>;

  async function onSubmit(payload: FormSubmitEvent<Schema>) {
    try {
      await authClient.signIn.email({
        email: payload.data.email,
        password: payload.data.password,
        rememberMe: payload.data.rememberMe,
        callbackURL: '/dashboard',
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
    } catch (error) {
      handleApiError(error, toast);
    }
  }
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    loading-auto
    loading-icon="i-lucide-loader"
    title="Login to your account"
    icon="i-lucide-log-in"
    :ui="{ providers: 'flex items-center gap-2 justify-center' }"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink to="/forgot-password" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our <ULink to="/terms" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
