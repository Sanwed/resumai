<script lang="ts" setup>
import type { Tags } from '~/generated/prisma';
import { tagVariants } from '.';

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