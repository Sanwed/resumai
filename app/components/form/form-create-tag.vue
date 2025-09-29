<script lang="ts" setup>
import z from 'zod';
import type { FetchError } from 'ofetch';
import { MAX_TAG_NAME_LENGTH, TAG_VARIANT_NAMES } from '~/constants';
import type { FormSubmitEvent, RadioGroupItem } from '@nuxt/ui'
import { tagVariants } from '../tag';

type Emits = {
  (e: 'on-success'): void
}

const emit = defineEmits<Emits>();

const schema = z.object({
  name: z.string().min(1, 'Введите название').max(MAX_TAG_NAME_LENGTH, `Максимум ${MAX_TAG_NAME_LENGTH} ${pluralize(MAX_TAG_NAME_LENGTH, ['символ', 'символа', 'символов'])}`),
  variant: z.enum(TAG_VARIANT_NAMES),
});

const toast = useToast();

const state = reactive<z.infer<typeof schema>>({
  name: '',
  variant: 'green',
});

const colorItems = ref<RadioGroupItem[]>(TAG_VARIANT_NAMES.map((tag) => ({
  value: tag,
  ui: {
    base: [tagVariants({ variant: tag }), 'relative ring-0 before:hidden'],
    indicator: [tagVariants({ variant: tag }), 'after:hidden absolute inset-0'],
  }
})));

const open = ref(false);

const resetForm = () => {
  state.name = '';
  state.variant = 'green';
}

const onSubmit = async (event: FormSubmitEvent<z.infer<typeof schema>>) => {
  const body = { ...event.data };

  try {
    await $fetch('/api/tags', {
      method: 'POST',
      body,
    });

    open.value = false;
    emit('on-success');
    resetForm();
  } catch (err) {
    const error = err as FetchError;
    toast.add({
      title: 'Что-то пошло не так',
      description: error.data.statusMessage,
      icon: 'ic:baseline-dangerous',
      color: 'error',
    })
  }
}
</script>

<template>
  <UPopover v-model:open="open" :ui="{
    content: 'p-4'
  }">
    <slot name="toggle" />

    <template #content>
      <UForm :schema="schema" :state="state" class="space-y-2" @submit="onSubmit">
        <UFormField name="name" required :ui="{
          error: 'mt-1'
        }">
          <UInput v-model="state.name" class="w-full" placeholder="Введите название" />
        </UFormField>
        <URadioGroup v-model="state.variant" :items="colorItems" orientation="horizontal"
          :ui="{ fieldset: 'justify-between' }" />
        <UButton loading-auto type="submit" variant="solid" size="sm" class="w-full justify-center">Создать</UButton>
      </UForm>
    </template>
  </UPopover>
</template>