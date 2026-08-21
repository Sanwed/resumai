<script lang="ts" setup>
  import { authClient } from '~/lib/auth-client';

  definePageMeta({
    layout: 'empty',
    middleware: 'auth',
  });

  const toast = useToast();

  useSeoMeta({
    title: 'Profile, Security & Account Settings',
    description:
      'Manage your ResumAI profile, email address, sign-in methods, account security, connected providers, and personal preferences in one secure place.',
  });

  const { data: session } = await authClient.useSession(useAuthFetch);

  const deleteConfirmationOpen = ref(false);
  const loading = ref(false);
  const deleteMessage = ref('');
  const verificationSent = ref(false);

  const onDelete = async () => {
    if (deleteMessage.value.trim() !== `delete ${session.value?.user.name}`) return;

    try {
      loading.value = true;
      await authClient.deleteUser({
        callbackURL: '/login',
      });
      verificationSent.value = true;
    } catch (e) {
      handleApiError(e, toast);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <UContainer v-if="session" class="max-w-5xl">
    <UPage>
      <UPageHeader
        title="Profile settings"
        :ui="{ wrapper: 'lg:flex-col lg:items-start' }"
        :links="[{ label: 'Go back', to: '/dashboard', icon: 'i-lucide-chevron-left' }]"
      />
      <UPageBody class="space-y-8">
        <ProfileAvatar :src="session.user.image" :alt="session.user.name ?? 'Account avatar'" />
        <ProfilePersonal :default-values="{ name: session.user.name }" />
        <ProfileMail :default-mail="session.user.email" />
        <ProfileProviders :default-mail="session.user.email" />
        <UCard variant="soft">
          <template #header>
            <h3 class="text-base font-semibold text-error">Danger zone</h3>
            <p class="text-sm text-muted">Irreversible and destructive actions.</p>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Delete account</p>
              <p class="text-xs text-muted">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <UButton
              label="Delete account"
              color="error"
              variant="outline"
              icon="i-lucide-trash-2"
              @click="deleteConfirmationOpen = true"
            />
          </div>
        </UCard>
      </UPageBody>
    </UPage>

    <AppConfirmation
      v-model="deleteConfirmationOpen"
      title="Delete account"
      :loading="loading"
      description="Are you sure you want to delete your account. This action can not be reverted"
      :action="{ color: 'error', label: 'Delete', disabled: deleteMessage.trim() !== `delete ${session.user.name}` }"
      @submit="onDelete"
    >
      <UFormField name="">
        <template #label>
          <p>
            Type <b>delete {{ session.user.name }}</b> to delete the account
          </p>
        </template>
        <template #help>
          <p v-if="verificationSent" class="text-error">
            Verification email has been sent to your email: {{ session.user.email }}
          </p>
        </template>
        <UInput v-model="deleteMessage" type="text" size="xs" />
      </UFormField>
    </AppConfirmation>
  </UContainer>
</template>
