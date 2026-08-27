import { permanentRedirects } from './shared/permanent-redirects';

const permanentRedirectRouteRules = Object.fromEntries(
  Object.entries(permanentRedirects).map(([path, to]) => [path, { redirect: { to, statusCode: 301 as const } }]),
);

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui', '@nuxt/content', '@vueuse/nuxt', '@nuxtjs/seo'],

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
    identity: {
      type: 'Organization',
      name: 'ResumAI',
      logo: '/android-chrome-512x512.png',
      sameAs: ['https://www.linkedin.com/in/sanwed/', 'https://github.com/Sanwed/resumai'],
    },
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

  robots: {
    blockAiBots: false,
    groups: [
      {
        userAgent: '*',
        contentUsage: { 'train-ai': 'n' },
        contentSignal: { 'ai-train': 'no' },
      },
    ],
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
    ...permanentRedirectRouteRules,

    '/': { prerender: true },
    '/changelog': { prerender: true },

    '/privacy/**': { prerender: true },
    '/terms/**': { prerender: true },
    '/cookies/**': { prerender: true },

    '/pricing': { swr: 3600 },

    '/dashboard': { prerender: false },
    '/dashboard/**': { prerender: false },
    '/profile': { prerender: false },
    '/billing': { prerender: false },
    '/login': { prerender: false },
    '/signup': { prerender: false },
    '/forgot-password': { prerender: false },
    '/reset-password': { prerender: false },
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      ignore: ['/_vercel/image'],
    },
  },
});
