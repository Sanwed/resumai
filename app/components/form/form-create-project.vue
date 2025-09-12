<!-- TODO: Доработать форму создания -->

<script lang="ts" setup>
import { DateFormatter, type CalendarDate, getLocalTimeZone } from '@internationalized/date';
import type { FormSubmitEvent } from '@nuxt/ui';
import z from 'zod';
import type { Tags } from '~/generated/prisma';

type Emits = {
  (e: 'on-success'): void
}

const emit = defineEmits<Emits>();

const df = new DateFormatter('ru-RU', {
  dateStyle: 'long'
})

const toast = useToast();

const { data: tags } = await useFetch<Tags[]>('/api/tags');

const open = ref(false);
const endDate = shallowRef<CalendarDate | null>(null);

const schema = z.object({
  name: z
    .string()
    .min(1, "Введите имя")
    .max(255, "Превышено максимальное количество символов"),
  description: z.string().nullish(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      variant: z.enum(["green", "red", "orange", "blue", "neutral"]).nullable(),
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
})

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

  const { error } = await useFetch('/api/projects', {
    method: 'POST',
    body,
  });

  if (error.value) {
    toast.add({
      title: 'Что-то пошло не так',
      description: error.value?.message,
      icon: 'ic:baseline-dangerous',
      color: 'error',
    })
    console.error(error.value);
    return;
  }

  open.value = false;
  emit('on-success');
}

watch(endDate, (newVal) => {
  state.endDate = newVal ? newVal.toDate(getLocalTimeZone()).toISOString() : null;
})
</script>

<template>
  <UModal v-model:open="open" :ui="{
    body: 'overflow-x-hidden'
  }" title="Создание проекта">
    <slot name="toggle" />

    <template #body>
      <UForm :state :schema class="space-y-4" @submit="onSubmit">
        <UCarousel drag-free v-slot="{ item }" :ui="{
          viewport: 'overflow-visible scrollbar-none',
          item: 'basis-auto'
        }" :items="tags">
          <Tag :tag="item" :selected="state.tags.some((tag) => tag.id === item.id)" @click="toggleTag" />
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
                <button v-if="endDate" type="button" aria-label="Очистить дату" class="size-5 flex justify-center items-center ml-auto transition-transform hover:scale-110" @click.stop="endDate = null">
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