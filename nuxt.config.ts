// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-06-27',
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' }
      ]
    }
  },
  plugins: [
    '~/plugins/trpcClient.ts',
  ],
  modules: [
    '@nuxt/ui',
    '@sidebase/nuxt-auth',
    '@vite-pwa/nuxt',
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
    host: '0.0.0.0',
    port: 3000
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
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'MediGuard',
      short_name: 'MediGuard',
      description: 'Medication tracking and reminder application',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa/icon-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
        {
          src: 'pwa/icon-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})
