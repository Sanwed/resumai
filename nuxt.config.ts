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
    '@nuxtjs/seo',
  ],

  devtools: {
    enabled: true,
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: 'ResumAI',
    env: 'production',
    indexable: true,
    trailingSlash: false,
  },

  schemaOrg: {
    identity: 'Organization',
  },

  ogImage: {
    zeroRuntime: true,
  },

  seo: {
    redirectToCanonicalSiteUrl: true,
    meta: {
      ogType: 'website',
      ogSiteName: 'ResumAI',
      twitterCard: 'summary_large_image',
      twitterSite: '@ResumAI',
      twitterCreator: '@Sanwed',
      themeColor: [
        { content: '#020618', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
    },
  },

  app: {
    head: {
      titleTemplate: '%s | ResumAI',
      htmlAttrs: { lang: 'en' },
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
  },

  css: ['~/assets/css/main.css', 'md-editor-v3/lib/style.css'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },

  appConfig: {
    ui: {
      colors: {
        primary: 'indigo',
        secondary: 'sky',
        success: 'emerald',
        warning: 'amber',
        error: 'red',
        neutral: 'neutral',
      },
    },
  },

  runtimeConfig: {
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/changelog': { prerender: true },

    '/privacy': { redirect: '/privacy/introduction' },
    '/privacy/**': { prerender: true },

    '/terms': { redirect: '/terms/acceptance-of-terms' },
    '/terms/**': { prerender: true },

    '/cookies': { redirect: '/cookies/introduction' },
    '/cookies/**': { prerender: true },

    '/pricing': { swr: 3600 },
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
});
