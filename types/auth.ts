import { z } from 'zod'

/**
 * Shared authentication schemas used by both client and server
 */

export const authSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('login'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  z.object({
    type: z.literal('register'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['user', 'caretaker'], {
      errorMap: () => ({ message: 'Please select a valid account type' })
    }),
  }),
])

// Extract individual schemas for convenience
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['user', 'caretaker'], {
    errorMap: () => ({ message: 'Please select a valid account type' })
  }),
})

// Role options for dropdowns
export const roleOptions = [
  {
    label: 'User',
    value: 'user' as const,
  },
  {
    label: 'Caretaker',
    value: 'caretaker' as const,
  },
]

// Type exports
export type AuthSchema = z.infer<typeof authSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
