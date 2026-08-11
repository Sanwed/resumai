export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxt/a11y',
    '@nuxtjs/device',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  css: ['~/assets/css/main.css', 'md-editor-v3/lib/style.css'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },

  runtimeConfig: {
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  routeRules: {
    '/privacy': { redirect: '/privacy/introduction', prerender: false },
    '/terms': { redirect: '/terms/acceptance-of-terms', prerender: false },
    '/cookies': { redirect: 'cookies/introduction', prerender: false },
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },

  ogImage: {
    zeroRuntime: true,
  },
});
