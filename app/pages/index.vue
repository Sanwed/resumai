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
      <template #title>
        <MDC :value="page.title" unwrap="p" />
      </template>

      <AppThemeImage
        src="/images/home/resumai-dashboard-hero.png"
        dark-src="/images/home/resumai-dashboard-hero-dark.png"
        alt="ResumAI dashboard showing candidate match score, strengths, skills, and secure resume processing"
        width="1536"
        height="1024"
        sizes="100vw sm:640px md:768px lg:1024px xl:1152px"
        class="mx-auto w-full max-w-7xl"
        preload
      />
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
      <AppThemeImage
        :src="section.image"
        :dark-src="section.darkImage"
        :alt="section.description"
        width="1254"
        height="1254"
        sizes="100vw sm:576px lg:640px"
        class="mx-auto w-full max-w-2xl"
      />
    </UPageSection>

    <UPageSection :title="page.features.title" :description="page.features.description">
      <UPageGrid>
        <UPageCard v-for="(item, index) in page.features.items" :key="index" v-bind="item" spotlight />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      data-nosnippet
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

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden" />
  </div>
</template>
