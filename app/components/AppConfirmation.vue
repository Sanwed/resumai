<script lang="ts" setup>
  type Props = {
    title: string;
    description?: string;
    loading?: boolean;
    action: {
      color: 'error' | 'warning' | 'success' | 'primary' | 'secondary';
      label: string;
      disabled?: boolean;
    };
  };
  defineProps<Props>();

  type Emits = {
    submit: [];
  };
  defineEmits<Emits>();

  const open = defineModel<boolean>({ default: false });
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #body>
      <slot />
    </template>
    <template #footer>
      <UButton variant="outline" color="neutral" label="Cancel" type="button" @click="open = false" />
      <UButton
        :loading="loading"
        loading-icon="i-lucide-loader"
        variant="solid"
        :color="action.color"
        :label="action.label"
        :disabled="action.disabled"
        type="button"
        @click="$emit('submit')"
      />
    </template>
  </UModal>
</template>
