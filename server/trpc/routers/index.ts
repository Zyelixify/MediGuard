import { createRouter } from '../trpc'
import { router as account } from './account'
import { router as event } from './event'
import { router as medication } from './medication'
import { router as scheduledMedication } from './scheduledMedication'
import { router as caretakerRelation } from './caretakerRelation'

export const appRouter = createRouter({
  account,
  event,
  medication,
  scheduledMedication,
  caretakerRelation,
})

// export type definition of API
export type AppRouter = typeof appRouter
