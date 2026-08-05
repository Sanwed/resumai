<script lang="ts" setup>
  import type { FetchError } from 'ofetch';
  import { MAX_AVATAR_FILE_SIZE } from '~/constants';
  import { authClient } from '~/lib/auth-client';

  type Props = {
    src?: string | null;
  };

  defineProps<Props>();

  const avatarFile = ref<File | null>(null);
  const newAvatarUrl = ref<string | null>(null);
  const loading = ref(false);

  const toast = useToast();

  watch(avatarFile, async (newAvatar) => {
    if (!newAvatar) return;
    if (newAvatar?.size > MAX_AVATAR_FILE_SIZE) {
      toast.add({
        title: 'Max file size exceeded',
        description: `Please, select new file not greater than ${formatFileSize(MAX_AVATAR_FILE_SIZE)}`,
        color: 'error',
      });
      avatarFile.value = null;
      return;
    }

    try {
      loading.value = true;
      const formData = new FormData();
      formData.append('file', newAvatar);

      const url = await $fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      newAvatarUrl.value = url;
      await authClient.updateUser({ image: url });
      toast.add({ title: 'Avatar has been changed', color: 'success' });
    } catch (e) {
      const error = e as FetchError;
      toast.add({
        description: error.statusMessage,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
      avatarFile.value = null;
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <UCard :ui="{ footer: 'bg-muted', body: 'flex gap-5 justify-between items-start' }">
    <template #default>
      <div>
        <h2 class="font-medium text-lg">Avatar</h2>
        <p class="text-sm text-muted">This is your avatar.</p>
        <p class="text-sm text-muted">Click on the avatar to upload a custom one from your files.</p>
      </div>
      <UFileUpload
        v-slot="{ open }"
        v-model="avatarFile"
        :disabled="loading"
        :dropzone="false"
        accept="image/*"
        class="relative"
      >
        <div v-if="loading" class="absolute bg-slate-100/60 inset-0 flex items-center justify-center rounded-full">
          <UIcon name="i-lucide-loader" size="20" class="animate-spin" />
        </div>
        <UAvatar
          as="button"
          type="button"
          :src="(newAvatarUrl || src) ?? '/avatar-placeholder.png'"
          alt="User avatar"
          class="size-20 hover:opacity-90 focus-visible:opacity-90"
          @click="open"
        />
      </UFileUpload>
    </template>
    <template #footer>
      <p>An avatar is optional.</p>
    </template>
  </UCard>
</template>
