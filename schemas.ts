import { z } from 'zod'

export const objectSchema = z.any().default({})
export const querySchema = z.object({ where: objectSchema, select: objectSchema })

// Account
export const accountRoleSchema = z.enum(['patient', 'caretaker'])
export const createAccountSchema = z.object({
  email: z.string().email(),
  role: accountRoleSchema,
})
export const updateAccountSchema = z.any(z.object({}))
