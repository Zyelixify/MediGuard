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

// Medication
export const createMedicationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.string(),
  endDate: z.string(),

  accountId: z.string(),
})
export const updateMedicationSchema = createMedicationSchema.merge(idObjectSchema)

// Scheduled Medication
export const updateScheduledMedicationTakenSchema = idObjectSchema.merge(z.object({ taken: z.boolean() }))
