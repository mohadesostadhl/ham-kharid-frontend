import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-27',
  ssr: false,
  devtools: { enabled: false },
  css: [
    '@fontsource/vazirmatn/400.css',
    '@fontsource/vazirmatn/500.css',
    '@fontsource/vazirmatn/600.css',
    '@fontsource/vazirmatn/700.css',
    '~/assets/main.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'هم‌خرید | با هم، به‌صرفه‌تر',
      meta: [
        {
          name: 'description',
          content: 'بازار خرید گروهی مستقیم از تولیدکننده؛ شفاف، ساده و به‌صرفه.',
        },
      ],
    },
  },
  routeRules: {
    ...(process.env.API_UPSTREAM
      ? { '/api/**': { proxy: `${process.env.API_UPSTREAM}/api/**` } }
      : {}),
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
    },
  },
  typescript: { strict: true },
})
