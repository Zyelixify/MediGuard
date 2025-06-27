import type { z } from 'zod'
import type { accountRoleSchema } from './schemas'

export type AccountRole = z.infer<typeof accountRoleSchema>
