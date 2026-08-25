<script setup lang="ts">
  import type { SerializeObject } from 'nitropack';
  import type Stripe from 'stripe';

  const [{ data: page }, { data: products, pending: loading, error }] = await Promise.all([
    useAsyncData('pricing', () => queryCollection('pricing').first()),
    useLazyFetch('/api/billing'),
  ]);

  useSeoMeta({
    title: () => page.value?.seo.title,
    description: () => page.value?.seo.description,
    ogImageAlt: 'ResumAI social card: token pack pricing',
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
        itemListElement: [{ name: 'Home', item: '/' }, { name: page.value?.seo.title ?? 'Pricing' }],
      }),
      ...(products.value?.data.map((item) => {
        const defaultPrice = item.default_price;
        const offer =
          defaultPrice && typeof defaultPrice !== 'string' && defaultPrice.unit_amount != null
            ? {
                '@type': 'Offer' as const,
                price: defaultPrice.unit_amount / 100,
                priceCurrency: defaultPrice.currency.toUpperCase(),
                availability: item.active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                url: '/pricing',
              }
            : undefined;

        return defineProduct({
          '@id': `#product-${item.id}`,
          name: item.name,
          description: item.description ?? undefined,
          url: '/pricing',
          sku: item.id,
          offers: offer,
        });
      }) ?? []),
    ]),
  );

  const getPriceLabel = (defaultPrice?: string | SerializeObject<Stripe.Price> | null) => {
    if (!defaultPrice || typeof defaultPrice === 'string') return;
    if (defaultPrice.unit_amount == null) return;

    return `${defaultPrice.unit_amount / 100} ${defaultPrice.currency.toUpperCase()}`;
  };

  const getProductFeatures = (features: SerializeObject<Stripe.Product.MarketingFeature>[]) => {
    return features.map((el) => el.name).filter((el) => el !== undefined);
  };
</script>

<template>
  <div v-if="page">
    <UPageHero :title="page.title" :description="page.description" />

    <UContainer>
      <div v-if="loading" role="status" aria-live="polite" class="h-40 w-full flex items-center justify-center">
        <UIcon name="i-lucide-loader" class="animate-spin size-8" aria-hidden="true" />
        <span class="sr-only">Loading pricing plans</span>
      </div>

      <UEmpty v-else-if="error" role="alert" icon="i-lucide-circle-x" variant="naked" :title="error.statusMessage" />

      <UEmpty v-else-if="!products?.data.length" icon="i-lucide-circle-x" variant="naked" title="Products not found" />
      <UPricingPlans v-else orientation="vertical" compact>
        <UPricingPlan
          v-for="(item, index) in products.data"
          :key="index"
          :title="item.name"
          :description="item.description ?? ''"
          :features="getProductFeatures(item.marketing_features)"
          :price="getPriceLabel(item.default_price)"
          :button="{
            to: '/billing',
            label: 'Login',
            size: 'xl',
            ui: { base: 'w-full max-w-40' },
            loadingAuto: true,
            loadingIcon: 'i-lucide-loader',
          }"
          orientation="horizontal"
          terms="Invoices and receipts available."
          :ui="{ root: 'lg:p-6 xl:p-6', body: 'justify-start', featureTitle: 'text-clip whitespace-normal' }"
        />
      </UPricingPlans>
    </UContainer>

    <UPageSection :title="page.faq.title" :description="page.faq.description">
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted',
        }"
      />
    </UPageSection>
  </div>
</template>
