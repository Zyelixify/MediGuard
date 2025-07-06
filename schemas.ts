import { z } from 'zod'

export const objectSchema = z.any().default({})
export const querySchema = z.object({ where: objectSchema, select: objectSchema })

const idSchema = z.string()
const idObjectSchema = z.object({ id: idSchema })

// Account
export const accountRoleSchema = z.enum(['patient', 'caretaker'])
export const createAccountSchema = z.object({
  email: z.string().email(),
  role: accountRoleSchema,
})
export const updateAccountSchema = z.any(z.object({}))

export const frequencySchema = z.enum(['Once a day', 'Twice a day', 'Three times a day', 'Four times a day', 'Once a week', 'Twice a week', 'Three times a week', 'Four times a week', 'Once a month'])

// Medication
const baseMedicationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  dosage: z.string(),
  frequency: frequencySchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  accountId: z.string(),
})

export const createMedicationSchema = baseMedicationSchema.refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return endDate >= startDate
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
})

export const updateMedicationSchema = baseMedicationSchema.merge(idObjectSchema).refine((data) => {
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  return endDate >= startDate
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
})

// Scheduled Medication
export const updateScheduledMedicationTakenSchema = idObjectSchema.merge(z.object({ taken: z.boolean() }))

// Caretaker Relation
export const createCaretakerRelationSchema = z.object({
  patientId: z.string(),
  caretakerId: z.string(),
})
