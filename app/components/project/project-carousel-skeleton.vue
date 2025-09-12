<script lang="ts" setup>
const items = Array(3).fill('');
</script>

<template>
  <UCarousel :items drag-free :ui="{
    item: 'basis-auto',
    viewport: 'overflow-y-hidden overflow-x-auto scrollbar-none',
  }">
    <ProjectCardSkeleton />
  </UCarousel>
</template>