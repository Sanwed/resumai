<script setup lang="ts">
  import z from 'zod';
  import type { FormSubmitEvent } from '@nuxt/ui';
  import { authClient } from '~/lib/auth-client';
  import { MIN_PASSWORD_LENGTH } from '~/constants';

  definePageMeta({
    layout: 'auth',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Create account',
    robots: 'noindex, follow',
    description:
      'Create your ResumAI account to analyze resumes with AI, match candidates to job descriptions, organize hiring projects, and generate actionable reports.',
    ogImageAlt: 'ResumAI social card: account creation',
  });

  defineOgImage('Base.takumi', {
    title: 'Create account',
    description:
      'Create your ResumAI account to analyze resumes with AI, match candidates to job descriptions, organize hiring projects, and generate actionable reports.',
  });

  const toast = useToast();

  const fields = [
    {
      name: 'name',
      type: 'text' as const,
      autocomplete: 'name',
      label: 'Name',
      placeholder: 'Enter your name',
      required: true,
    },
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
      autocomplete: 'new-password',
      placeholder: 'Enter your password',
      required: true,
    },
  ];

  const providers = [
    {
      icon: 'i-simple-icons-github',
      label: 'Sign up with GitHub',
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
      label: 'Sign up with Google',
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
      label: 'Sign up with LinkedIn',
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
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    email: z.email('Invalid email'),
    password: z
      .string({ error: 'Password required' })
      .min(MIN_PASSWORD_LENGTH, `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`),
  });

  async function onSubmit(payload: FormSubmitEvent<z.output<typeof schema>>) {
    try {
      await authClient.signUp.email({
        name: payload.data.name,
        email: payload.data.email,
        password: payload.data.password,
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
    :submit="{ label: 'Create account' }"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-log-in"
    :ui="{ providers: 'flex items-center gap-2 justify-center' }"
    @submit="onSubmit"
  >
    <template #title>
      <h1>Create an account</h1>
    </template>
    <template #description>
      Already have an account? <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink to="/terms/acceptance-of-terms" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
