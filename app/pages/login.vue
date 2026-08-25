<script setup lang="ts">
  import z from 'zod';
  import type { FormSubmitEvent } from '@nuxt/ui';
  import { authClient } from '~/lib/auth-client';

  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Login',
    robots: 'noindex, follow',
    description:
      'Log in to ResumAI to access your projects, analyze resumes, compare candidates with job requirements, and manage your account securely online.',
    ogImageAlt: 'ResumAI social card: account login',
  });

  defineOgImage('Base.takumi', {
    title: 'Login',
    description:
      'Log in to ResumAI to access your projects, analyze resumes, compare candidates with job requirements, and manage your account securely online.',
  });

  const toast = useToast();

  const fields = [
    {
      name: 'email',
      type: 'email' as const,
      autocomplete: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      autocomplete: 'current-password',
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
      label: 'Sign in with GitHub',
      square: true,
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
        label: 'sr-only',
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
      label: 'Sign in with Google',
      square: true,
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
        label: 'sr-only',
      },
      onClick: async () => {
        try {
          await signInWithProvider('google');
        } catch (error) {
          handleApiError(error, toast);
        }
      },
    },
    {
      icon: 'i-simple-icons-linkedin',
      label: 'Sign in with LinkedIn',
      square: true,
      size: 'xl' as const,
      loadingAuto: true,
      ui: {
        base: 'w-auto rounded-full m-0',
        label: 'sr-only',
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

  async function onSubmit(payload: FormSubmitEvent<z.output<typeof schema>>) {
    try {
      await authClient.signIn.email({
        email: payload.data.email,
        password: payload.data.password,
        rememberMe: payload.data.rememberMe,
        callbackURL: '/dashboard',
        fetchOptions: {
          onError: (event) => {
            console.error(event.error);
            toast.add({
              description: event.error.message,
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
    icon="i-lucide-log-in"
    :ui="{ providers: 'flex items-center gap-2 justify-center' }"
    @submit="onSubmit"
  >
    <template #title>
      <h1>Login to your account</h1>
    </template>
    <template #description>
      Don't have an account? <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink to="/forgot-password" class="text-primary font-medium">Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our
      <ULink to="/terms/acceptance-of-terms" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
