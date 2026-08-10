<script lang="ts" setup>
  import { formatTimeAgo } from '@vueuse/core';

  type Props = {
    link: string | null;
    title: string;
    createdAt: Date;
    message?: string;
    chip?: boolean;
  };
  defineProps<Props>();

  type Emits = {
    click: [PointerEvent];
  };
  defineEmits<Emits>();
</script>

<template>
  <NuxtLink
    :to="link ?? ''"
    :class="[
      'px-3 py-2.5 hover:bg-elevated/50 flex items-center gap-3 relative border-l-2',
      chip ? 'border-l-primary-400' : 'border-l-transparent',
    ]"
    @click="(event) => $emit('click', event)"
  >
    <div class="text-sm flex-1">
      <p class="flex items-center justify-between">
        <span class="text-highlighted font-medium">{{ title }}</span>

        <time :datetime="createdAt" class="text-muted text-xs" v-text="formatTimeAgo(new Date(createdAt))" />
      </p>

      <p v-if="message" class="text-dimmed">
        {{ message }}
      </p>
    </div>
  </NuxtLink>
</template>
