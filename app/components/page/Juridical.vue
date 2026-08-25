<script lang="ts" setup>
  import type { PageCollections } from '@nuxt/content';

  type Props = {
    collection: keyof PageCollections;
    titleTemplate?: string | null;
    seoSubtitle?: string;
  };
  const props = defineProps<Props>();

  const route = useRoute();

  const [{ data: navigation }, { data: page }, { data: surround }] = await Promise.all([
    useAsyncData(`${props.collection}-navigation`, () => queryCollectionNavigation(props.collection), {
      transform: (data) => data.find((item) => item.path === `/${props.collection}`)?.children || [],
    }),
    useAsyncData(route.path, () => queryCollection(props.collection).path(route.path).first()),
    useAsyncData(`${route.path}-surround`, () => {
      return queryCollectionItemSurroundings(props.collection, route.path, {
        fields: ['description'],
      });
    }),
  ]);

  useSeoMeta({
    title: () => page.value?.seo.title,
    titleTemplate: () => `%s - ${props.titleTemplate}`,
    description: () => page.value?.seo.description,
    ogImageAlt: () => `ResumAI social card: ${props.titleTemplate ?? props.collection}`,
  });

  defineOgImage('Base.takumi', {
    title: page.value?.seo.title,
    description: page.value?.seo.description,
    subTitle: props.seoSubtitle,
  });

  const pageRouteName = computed(() => route.name?.toString().split('-')[0]);
  const collectionLandingPath = computed(() => {
    const landingPaths: Partial<Record<keyof PageCollections, string>> = {
      privacy: '/privacy/introduction',
      terms: '/terms/acceptance-of-terms',
      cookies: '/cookies/introduction',
    };

    return landingPaths[props.collection] || `/${props.collection}`;
  });

  useSchemaOrg(
    defineBreadcrumb({
      name: `${pageRouteName.value} breadcrumb`,
      itemListElement: [
        { name: 'Home', item: '/' },
        { name: props.titleTemplate, item: collectionLandingPath.value },
        { name: page.value?.title },
      ],
    }),
  );
</script>

<template>
  <UContainer v-if="page">
    <UPage>
      <template #left>
        <UPageAside class="block">
          <UContentNavigation :navigation="navigation" :ui="{ list: 'mx-0 mt-0' }" />
        </UPageAside>
      </template>

      <UPageHeader :title="page.title" :description="page.description" />

      <UPageBody>
        <ContentRenderer v-if="page.body" :value="page" />
        <USeparator v-if="surround?.length" />
        <UContentSurround :surround="surround" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
