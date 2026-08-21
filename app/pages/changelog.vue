<script setup lang="ts">
  const route = useRoute();

  const [{ data: page }, { data: versions }] = await Promise.all([
    useAsyncData('changelog', () => queryCollection('changelog').first()),
    useAsyncData(route.path, () => queryCollection('versions').order('date', 'DESC').all()),
  ]);

  useSeoMeta({
    title: () => page.value?.seo.title,
    description: () => page.value?.seo.description,
  });

  defineOgImage('Base.takumi', {
    title: page.value?.seo.title,
    description: page.value?.seo.description,
  });

  useSchemaOrg(
    computed(() => [
      defineWebPage({
        '@type': ['WebPage', 'CollectionPage'],
      }),
      defineBreadcrumb({
        itemListElement: [{ name: 'Home', item: '/' }, { name: page.value?.seo.title ?? 'Changelog' }],
      }),
      ...(versions.value?.map((version, index) =>
        defineArticle({
          '@id': `#release-${index + 1}`,
          '@type': 'TechArticle',
          headline: version.title,
          description: version.description,
          datePublished: version.date,
          image: version.image,
          articleSection: ['Product updates'],
          isAccessibleForFree: true,
        }),
      ) ?? []),
    ]),
  );
</script>

<template>
  <UContainer>
    <UPageHeader v-bind="page" class="py-12.5" />

    <UPageBody>
      <UChangelogVersions>
        <UChangelogVersion v-for="(version, index) in versions" :key="index" v-bind="version">
          <template #body>
            <ContentRenderer :value="version.body" />
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </UPageBody>
  </UContainer>
</template>
