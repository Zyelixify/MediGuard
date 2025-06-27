import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { QueryCache, QueryClient, VueQueryPlugin, dehydrate, hydrate } from '@tanstack/vue-query'
import { useState } from '#app'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 15000 } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipError) {
          return
        }

        if (!import.meta.server) {
          useToast().add({
            title: 'Error',
            description: error instanceof Error ? error.message : String(error),
            duration: 5000,
            color: 'error',
          })
        }
      },
    }),
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
