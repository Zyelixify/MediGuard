import { createRouter } from '../trpc'
import { router as account } from './account'
import { router as event } from './event'

export const appRouter = createRouter({
  account,
  event,
})

// export type definition of API
export type AppRouter = typeof appRouter
