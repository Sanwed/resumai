<script lang="ts" setup>
  import { authClient } from '~/lib/auth-client';
  import type { SerializeObject } from 'nitropack';
  import type Stripe from 'stripe';

  definePageMeta({
    layout: 'empty',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Billing',
    ogTitle: 'Billing',
    description: 'Add tokens to your account',
    ogDescription: 'Add tokens to your account',
  });

  const { data: session } = await authClient.useSession(useAuthFetch);
  const { data: products, pending: loading, error } = await useLazyFetch('/api/billing');

  const getPriceLabel = (defaultPrice?: string | SerializeObject<Stripe.Price> | null) => {
    if (!defaultPrice || typeof defaultPrice === 'string') return;
    if (defaultPrice.unit_amount == null) return;

    return `${defaultPrice.unit_amount / 100} ${defaultPrice.currency.toUpperCase()}`;
  };

  const getProductFeatures = (features: SerializeObject<Stripe.Product.MarketingFeature>[]) => {
    return features.map((el) => el.name).filter((el) => el !== undefined);
  };

  const onBuyClick = async (tokensValue?: string, defaultPrice?: string | SerializeObject<Stripe.Price> | null) => {
    if (!defaultPrice || typeof defaultPrice === 'string') return;
    if (defaultPrice.id == null) return;

    const { url } = await $fetch('/api/billing', {
      method: 'POST',
      query: { priceId: defaultPrice.id, tokensValue },
    });

    navigateTo(url, {
      external: true,
    });
  };
</script>

<template>
  <UContainer v-if="session" class="max-w-5xl">
    <UPage>
      <UPageHeader
        title="Add tokens to your account"
        description="Power your resume analyses with flexible token packs — buy once, use anytime, no subscription required."
        :ui="{ wrapper: 'lg:flex-col lg:items-start' }"
        :links="[{ label: 'Go back', to: '/dashboard', icon: 'i-lucide-chevron-left' }]"
      />

      <UPageBody class="space-y-10">
        <UAlert
          icon="i-lucide-sparkles"
          color="primary"
          variant="subtle"
          title="What are tokens?"
          description="Tokens are ResumAI's currency for AI-powered work — every resume analysis, candidate comparison, and report you generate consumes tokens. Purchase a pack below and they're added to your account instantly, ready to use across all your projects."
        />

        <div v-if="loading" class="h-40 w-full flex items-center justify-center">
          <UIcon name="i-lucide-loader" class="animate-spin size-8" />
        </div>

        <UEmpty v-else-if="error" icon="i-lucide-circle-x" variant="naked" :title="error.statusMessage" />

        <UEmpty
          v-else-if="!products?.data.length"
          icon="i-lucide-circle-x"
          variant="naked"
          title="Products not found"
        />

        <UPricingPlans v-else orientation="vertical" compact>
          <UPricingPlan
            v-for="(item, index) in products.data"
            :key="index"
            :title="item.name"
            :description="item.description ?? ''"
            :features="getProductFeatures(item.marketing_features)"
            :price="getPriceLabel(item.default_price)"
            :button="{
              label: 'Buy',
              size: 'xl',
              ui: { base: 'w-full max-w-40' },
              loadingAuto: true,
              loadingIcon: 'i-lucide-loader',
              onClick: () => onBuyClick(item.metadata.tokens_value, item.default_price),
            }"
            orientation="horizontal"
            terms="Invoices and receipts available."
            :ui="{ root: 'lg:p-6 xl:p-6', body: 'justify-start', featureTitle: 'text-clip whitespace-normal' }"
          />
        </UPricingPlans>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
