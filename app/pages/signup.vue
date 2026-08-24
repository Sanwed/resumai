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
  const verificationSent = ref(false);

  const fields = [
    {
      name: 'name',
      type: 'text' as const,
      label: 'Name',
      placeholder: 'Enter your name',
      required: true,
    },
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
        callbackURL: '/login',
        fetchOptions: {
          onSuccess: () => {
            verificationSent.value = true;
          },
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
    title="Create an account"
    :submit="{ label: 'Create account' }"
    loading-auto
    loading-icon="i-lucide-loader"
    icon="i-lucide-log-in"
    :ui="{ providers: 'flex items-center gap-2 justify-center' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>

    <template #validation>
      <UAlert v-if="verificationSent" title="Check your email to verify your account" color="success" variant="soft" />
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink to="/terms/acceptance-of-terms" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
