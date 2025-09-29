<script lang="ts" setup>
import type { FetchError } from 'ofetch';
import { DateFormatter, type CalendarDate, getLocalTimeZone } from '@internationalized/date';
import type { FormSubmitEvent } from '@nuxt/ui';
import z from 'zod';
import type { Tags } from '~/generated/prisma';
import { TAG_VARIANT_NAMES } from '~/constants';

type Emits = {
  (e: 'on-success'): void
}

const emit = defineEmits<Emits>();

const df = new DateFormatter('ru-RU', {
  dateStyle: 'long'
})

const toast = useToast();

const { data: tags, refresh: refreshTags } = await useFetch<Tags[]>('/api/tags/');

const open = ref(false);
const endDate = shallowRef<CalendarDate | null>(null);

const schema = z.object({
  name: z
    .string()
    .min(1, "Введите имя")
    .max(255, "Превышено максимальное количество символов"),
  description: z.string().max(500, { error: 'Превышено максимальное количество символов' }).nullish(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      variant: z.enum(TAG_VARIANT_NAMES),
    })
  ),
  vacancyText: z.string().min(1, "Введите корректное описание вакансии"),
  endDate: z.string().nullish(),
});

const state = reactive<z.infer<typeof schema>>({
  name: '',
  description: '',
  tags: [],
  vacancyText: '',
  endDate: null,
});

const resetForm = () => {
  state.name = '';
  state.description = '';
  state.tags = [];
  state.vacancyText = '';
  state.endDate = null;
}

const toggleTag = (id: string) => {
  const selectedIndex = state.tags.findIndex((tag) => tag.id === id);

  if (selectedIndex === -1) {
    const tagToPush = tags.value?.find((tag) => tag.id === id);
    if (!tagToPush) return;
    state.tags.push(tagToPush);
  } else {
    state.tags.splice(selectedIndex, 1);
  }
}

const onSubmit = async (event: FormSubmitEvent<z.infer<typeof schema>>) => {
  const body = {
    ...event.data,
  }

  try {
    await $fetch('/api/projects', {
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

watch(endDate, (newVal) => {
  state.endDate = newVal ? newVal.toDate(getLocalTimeZone()).toISOString() : null;
})
</script>

<template>
  <UModal v-model:open="open" :ui="{
    body: 'overflow-x-hidden flex flex-col gap-y-2'
  }" title="Создание проекта">
    <slot name="toggle" />

    <template #body>
      <div class="flex items-center gap-x-2">
        <p class="text-sm text-muted">Создать новый тег</p>
        <FormCreateTag @on-success="refreshTags()">
          <template #toggle>
            <UButton variant="soft" size="sm" icon="i-material-symbols-add"
              class="size-5 outline outline-primary-300 rounded-full justify-center" aria-label="Создать тег" />
          </template>
        </FormCreateTag>
      </div>
      <UForm :state="state" :schema="schema" class="space-y-4" @submit="onSubmit">
        <UCarousel v-slot="{ item }" drag-free :ui="{
          viewport: 'overflow-visible scrollbar-none',
          item: 'basis-auto'
        }" :items="tags">
          <div class="flex gap-x-4">
            <TagCard :tag="item" :selected="state.tags.some((tag) => tag.id === item.id)" @click="toggleTag" />
          </div>
        </UCarousel>
        <UFormField label="Название" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Описание проекта" name="description">
          <UTextarea v-model="state.description" autoresize :maxrows="6" class="w-full" />
        </UFormField>
        <UFormField label="Описание вакансии" name="vacancyText" required>
          <UTextarea v-model="state.vacancyText" autoresize :maxrows="10" class="w-full" />
        </UFormField>
        <UFormField label="Дата завершения" name="endDate">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-lucide-calendar" class="w-full text-muted">
              {{ endDate ? df.format(endDate.toDate(getLocalTimeZone())) : 'Выберите дату' }}

              <template #trailing>
                <button v-if="endDate" type="button" aria-label="Очистить дату"
                  class="size-5 flex justify-center items-center ml-auto transition-transform hover:scale-110"
                  @click.stop="endDate = null">
                  <UIcon name="i-lucide-x" class="size-5" />
                </button>
              </template>
            </UButton>

            <template #content>
              <UCalendar v-model="endDate" class="p-2" />
            </template>
          </UPopover>
        </UFormField>
        <UButton loading-auto type="submit">Отправить</UButton>
      </UForm>
    </template>
  </UModal>
</template>