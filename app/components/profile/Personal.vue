<script lang="ts" setup>
  import type { FetchError } from 'ofetch';
  import type { FormSubmitEvent } from '@nuxt/ui';
  import type z from 'zod';
  import { userUpdateSchema } from '~/types/schema';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    defaultValues?: {
      name?: string;
    };
  };
  const props = defineProps<Props>();

  const toast = useToast();

  const formState = reactive({
    name: props.defaultValues?.name ?? '',
  });

  const formRef = useTemplateRef('editForm');

  const onSubmit = async (event: FormSubmitEvent<z.output<typeof userUpdateSchema>>) => {
    try {
      await authClient.updateUser({
        name: event.data.name,
      });
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    }
  };
</script>

<template>
  <UCard :ui="{ footer: 'bg-muted flex gap-4 flex-col md:justify-between md:items-center md:flex-row' }">
    <template #header>
      <h2 class="font-medium text-lg">Personal information</h2>
      <p class="text-sm text-muted">Please enter your personal information in the fields below.</p>
    </template>
    <UForm
      ref="editForm"
      :state="formState"
      :schema="userUpdateSchema"
      class="grid grid-cols-1 sm:grid-cols-2"
      @submit="onSubmit"
    >
      <UFormField label="Full name" name="name">
        <UInput v-model="formState.name" autocomplete="name" placeholder="Your name" class="w-full" />
      </UFormField>
    </UForm>
    <template #footer>
      <p>Please use {{ 255 }} characters at maximum</p>
      <UButton
        label="Save changes"
        icon="i-lucide-check"
        loading-auto
        class="justify-center"
        @click="formRef?.submit"
      />
    </template>
  </UCard>
</template>
