<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import type { Tags } from '~/generated/prisma';

const tagVariants = cva('rounded-full flex gap-1 transition-colors items-center py-0.5 px-1.5 before:size-1 before:rounded-full outline', {
  variants: {
    variant: {
      green: 'bg-primary-100 text-primary before:bg-primary outline-primary-300 hover:bg-primary-200',
      red: 'bg-error-100 text-error before:bg-error outline-error-300 hover:bg-error-200',
      orange: 'bg-warning-100 text-warning before:bg-warning outline-warning-300 hover:bg-warning-200',
      blue: 'bg-secondary-100 text-secondary before:bg-secondary outline-secondary-300 hover:bg-secondary-200',
      neutral: 'bg-neutral-100 text-neutral-600 before:bg-neutral-600 outline-neutral-300 hover:bg-neutral-200',
    },
    selected: {
      true: 'ring ring-4 ring-neutral-200',
      false: ''
    }
  },
  defaultVariants: {
    variant: 'green',
  }
})

type Props = {
  tag: Tags;
  selected?: boolean,
}

type Emits = {
  'click': [id: string],
}

const { tag, selected } = defineProps<Props>()
defineEmits<Emits>()

</script>

<template>
  <button type="button" :class="tagVariants({ variant: tag.variant, selected })" @click="$emit('click', tag.id)">
    <span class="text-xs">{{ tag.name }}</span>
  </button>
</template>