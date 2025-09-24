<script setup lang="ts">
import z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '~/constants';
import { authClient } from '~/lib/auth-client';
import type { ErrorContext } from 'better-auth/vue';

const schema = z.object({
  name: z.string().min(1, { error: 'Имя обязательно' }).max(255, { error: 'Максимальная длина 255 символов' }),
  email: z.email('Некорректный email').max(255, { error: 'Максимальная длина 255 символов' }),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, { error: `Минимальная длина ${MIN_PASSWORD_LENGTH} ${pluralize(MIN_PASSWORD_LENGTH, ['символ', 'символа', 'символов'])}` })
    .max(MAX_PASSWORD_LENGTH, { error: `Максимальная длина ${MAX_PASSWORD_LENGTH} ${pluralize(MAX_PASSWORD_LENGTH, ['символ', 'символа', 'символов'])}` }),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

const state = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
});

const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const toast = useToast();

const onSuccess = async () => {
  await navigateTo('/overview');
}

const onError = (ctx: ErrorContext) => {
  toast.add({
    title: 'Что-то пошло не так',
    description: ctx.error.message,
    icon: 'ic:baseline-dangerous',
    color: 'error',
  })
}

async function onSubmit(event: FormSubmitEvent<z.infer<typeof schema>>) {
  await authClient.signUp.email({
    name: event.data.name,
    email: event.data.email,
    password: event.data.password,
    callbackURL: '/overview'
  }, {
    onSuccess,
    onError,
  })
}

async function onGoogleAuth() {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: '/overview',
  }, {
    onError,
  })
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-2" @submit="onSubmit">
    <UFormField label="Имя" name="name" required>
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" trailing-icon="material-symbols:alternate-email" type="email" class="w-full" />
    </UFormField>
    <UFormField label="Пароль" name="password" required>
      <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" :ui="{trailing: 'pe-1'}" class="w-full">
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            :aria-pressed="showPassword"
            aria-controls="password"
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>
    </UFormField>
    <UFormField label="Подтвердите пароль" name="passwordConfirm" required>
      <UInput v-model="state.passwordConfirm" :type="showPasswordConfirm ? 'text' : 'password'" :ui="{trailing: 'pe-1'}" class="w-full">
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            :icon="showPasswordConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="showPasswordConfirm ? 'Скрыть пароль' : 'Показать пароль'"
            :aria-pressed="showPasswordConfirm"
            aria-controls="passwordConfirm"
            @click="showPasswordConfirm = !showPasswordConfirm"
          />
        </template>
      </UInput>
    </UFormField>
    <UButton loading-auto class="mt-2 w-full justify-center" size="xl" type="submit">Зарегистрироваться</UButton>
  </UForm>
  <div class="pt-4 border-t border-primary/20">
    <UButton loading-auto color="secondary" icon="mdi:google" size="xl" class="w-full justify-center" @click="onGoogleAuth">Google</UButton>
  </div>
  <div class="pt-4 border-t border-primary/20">
    <p>Уже есть аккаунт? <ULink to="/auth/login" class="text-secondary">Войти</ULink>
    </p>
  </div>
</template>