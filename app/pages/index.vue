<script setup lang="ts">
  const { data: page } = await useAsyncData('index', () => queryCollection('index').first());

  useSeoMeta({
    title: () => page.value?.seo.title,
    description: () => page.value?.seo.description,
    ogImageAlt: 'ResumAI social card: AI resume screening and job matching',
  });

  defineOgImage('Base.takumi', {
    title: page.value?.seo.title,
    description: page.value?.seo.description,
  });
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description" :links="page.hero.links" class="relative">
      <template #top>
        <div
          class="bg-radial to-transparent from-primary/20 dark:from-primary/30 pointer-events-none h-full max-h-screen w-full absolute top-0"
        />
      </template>

      <template #title>
        <MDC :value="page.title" unwrap="p" />
      </template>

      <PromotionalVideo />
    </UPageHero>

    <UPageSection
      v-for="(section, index) in page.sections"
      :key="index"
      :title="section.title"
      :description="section.description"
      :orientation="section.orientation"
      :reverse="section.reverse"
      :features="section.features"
    >
    </UPageSection>

    <UPageSection :title="page.features.title" :description="page.features.description">
      <UPageGrid>
        <UPageCard v-for="(item, index) in page.features.items" :key="index" v-bind="item" spotlight />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      :headline="page.testimonials.headline"
      :title="page.testimonials.title"
      :description="page.testimonials.description"
    >
      <UPageColumns>
        <UPageCard
          v-for="(testimonial, index) in page.testimonials.items"
          :key="index"
          variant="subtle"
          :description="testimonial.quote"
          :ui="{ description: 'before:content-[open-quote] after:content-[close-quote]' }"
        >
          <template #footer>
            <UUser v-bind="testimonial.user" size="lg" />
          </template>
        </UPageCard>
      </UPageColumns>
    </UPageSection>

    <USeparator />

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden">
      <div class="bg-linear-to-b from-primary/20 to-transparent h-40 w-full absolute top-0 left-0" />
    </UPageCTA>
  </div>
</template>
