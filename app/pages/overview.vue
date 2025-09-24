<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
})

useHead({
  title: 'ResumAI',
  meta: () => [
    { name: 'description', content: 'Анализ резюме соискателей с помощью ИИ инструментов' },
    { property: 'og:locale', content: 'ru_RU' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'ResumAI' },
    { property: 'og:title', content: 'ResumAI' },
    { property: 'og:description', content: 'Анализ резюме соискателей с помощью ИИ инструментов' },
  ]
})
</script>

<template>
  <PageOverview />
</template>