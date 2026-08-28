<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import type z from 'zod';
  import { userUpdateSchema } from '~/types/schema';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    defaultMail?: string;
  };
  const props = defineProps<Props>();

  const toast = useToast();

  const formState = reactive({
    email: props.defaultMail ?? '',
  });

  const formRef = useTemplateRef('editForm');

  const verificationSent = ref(false);

  const onSubmit = async (event: FormSubmitEvent<z.output<typeof userUpdateSchema>>) => {
    try {
      if (!event.data.email || event.data.email === props.defaultMail) return;
      const { error } = await authClient.changeEmail({
        newEmail: event.data.email,
        callbackURL: '/profile',
      });

      if (error) {
        handleApiError(error, toast);
        return;
      }

      verificationSent.value = true;
    } catch (e) {
      handleApiError(e, toast);
    }
  };
</script>

<template>
  <UCard :ui="{ footer: 'bg-muted justify-between items-center flex' }">
    <template #header>
      <h2 class="font-medium text-lg">Email</h2>
      <p class="text-sm text-muted">Enter the email address you want to use to log in with ResumAI</p>
    </template>
    <UForm
      ref="editForm"
      :state="formState"
      :schema="userUpdateSchema"
      class="grid grid-cols-1 sm:grid-cols-2"
      @submit="onSubmit"
    >
      <UFormField label="Email" name="email">
        <UInput v-model="formState.email" type="email" autocomplete="email" placeholder="Your email" class="w-full" />
      </UFormField>
    </UForm>
    <template #footer>
      <p v-if="verificationSent" role="status" aria-live="polite" class="text-sm text-amber-800 dark:text-amber-300">
        Verification letter has been sent to your email: {{ props.defaultMail }}
      </p>
      <UButton
        label="Save changes"
        icon="i-lucide-check"
        loading-auto
        class="justify-center w-full md:w-auto md:ml-auto"
        @click="formRef?.submit"
      />
    </template>
  </UCard>
</template>
