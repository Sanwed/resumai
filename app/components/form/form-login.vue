<script setup lang="ts">
import z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { authClient } from '~/lib/auth-client';
import type { ErrorContext } from 'better-auth/vue';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '~/constants';

const schema = z.object({
  email: z.email('Некорректный email').max(255, { error: 'Максимальная длина 255 символов' }),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, { error: `Минимальная длина ${MIN_PASSWORD_LENGTH} ${pluralize(MIN_PASSWORD_LENGTH, ['символ', 'символа', 'символов'])}` })
    .max(MAX_PASSWORD_LENGTH, { error: `Максимальная длина ${MAX_PASSWORD_LENGTH} ${pluralize(MAX_PASSWORD_LENGTH, ['символ', 'символа', 'символов'])}` }),
  rememberMe: z.boolean().default(false),
})
const state = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const toast = useToast();
const showPassword = ref(false);

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
  await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: event.data.rememberMe,
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
    <UFormField name="rememberMe">
      <UCheckbox v-model="state.rememberMe" label="Запомнить меня" class="w-full" />
    </UFormField>
    <UButton loading-auto class="mt-2 w-full justify-center" size="xl" type="submit">Войти</UButton>
  </UForm>
  <div class="pt-4 border-t border-primary/20">
    <UButton loading-auto color="secondary" icon="mdi:google" size="xl" class="w-full justify-center" @click="onGoogleAuth">Google
    </UButton>
  </div>
  <div class="pt-4 border-t border-primary/20">
    <p>Ещё нет аккаунта? <ULink to="/auth/register" class="text-secondary">Зарегистрироваться</ULink>
    </p>
  </div>
</template>