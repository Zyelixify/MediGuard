// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' }
      ],
      htmlAttrs: {
        lang: 'en'
      }
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  plugins: [
    '~/plugins/trpcClient.ts',
  ],
  modules: [
    '@nuxt/ui',
    '@sidebase/nuxt-auth',
  ],
  css: ['~/assets/css/main.css'],
  build: {
    transpile: [
      'trpc-nuxt'
    ],
  },
  typescript: {
    shim: false
  },
  auth: {
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
  devtools: {
    enabled: false,
  },
  devServer: {
    host: process.env.NUXT_HOST || process.env.HOST || '0.0.0.0',
    port: Number(process.env.NUXT_PORT || process.env.PORT || 3000),
    url: process.env.CODESPACE_NAME
      ? `https://${process.env.CODESPACE_NAME}-${process.env.NUXT_PORT || process.env.PORT || '3000'}.app.github.dev`
      : undefined,
  },
  nitro: {
    experimental: {
      wasm: true,
    },
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'info',
        'success',
        'warning',
        'error'
      ]
    }
  }
})
