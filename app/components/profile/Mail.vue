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

  type Schema = z.output<typeof userUpdateSchema>;
  const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    try {
      if (!event.data.email || event.data.email === props.defaultMail) return;
      await authClient.changeEmail({
        newEmail: event.data.email,
        callbackURL: '/profile',
      });
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
        <UInput v-model="formState.email" placeholder="Your email" class="w-full" />
      </UFormField>
    </UForm>
    <template #footer>
      <p v-if="verificationSent" class="text-sm text-warning">
        Verification letter has been sent to your email: {{ props.defaultMail }}
      </p>
      <UButton label="Save changes" icon="i-lucide-check" loading-auto class="ml-auto" @click="formRef?.submit" />
    </template>
  </UCard>
</template>
