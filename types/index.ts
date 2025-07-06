import type { z } from 'zod'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../server/trpc/routers'
import type { accountRoleSchema, createMedicationSchema, frequencySchema } from '../schemas'

export type RouterOutput = inferRouterOutputs<AppRouter>
export type RouterInput = inferRouterInputs<AppRouter>

export type AccountRole = z.infer<typeof accountRoleSchema>

export type AccountGetMany = RouterOutput['account']['findManyAccount'][number]
export type AccountGetOne = RouterOutput['account']['findOneAccount']

export type MedicationGetMany = RouterOutput['medication']['findManyMedication'][number]
export type MedicationGetOne = RouterOutput['medication']['findManyMedication'][number] // Add specific findOne if needed

export type ScheduledMedicationGetMany = RouterOutput['scheduledMedication']['findManyMedication'][number]

export type CaretakerRelationGetMany = RouterOutput['caretakerRelation']['findManyCaretakerRelations'][number]
export type CaretakerRelationGetOne = RouterOutput['caretakerRelation']['findOneCaretakerRelations']

export type MedicationCreationFormData = z.infer<typeof createMedicationSchema>
export type FrequencyType = z.infer<typeof frequencySchema>
