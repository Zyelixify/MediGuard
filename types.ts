import type { z } from 'zod'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from './server/trpc/routers'
import type { accountRoleSchema } from './schemas'

export type RouterOutput = inferRouterOutputs<AppRouter>
export type RouterInput = inferRouterInputs<AppRouter>

export type AccountRole = z.infer<typeof accountRoleSchema>

export type AccountGetMany = RouterOutput['account']['findManyAccount'][number]
export type AccountGetOne = RouterOutput['account']['findOneAccount']

export type MedicationGetMany = RouterOutput['medication']['findManyMedication'][number]

export type ScheduledMedicationGetMany = RouterOutput['scheduledMedication']['findManyMedication'][number]

export type CaretakerRelationGetMany = RouterOutput['caretakerRelation']['findManyCaretakerRelations'][number]
export type CaretakerRelationGetOne = RouterOutput['caretakerRelation']['findOneCaretakerRelations']
