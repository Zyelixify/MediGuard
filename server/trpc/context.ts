import type { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import type { ExtendedPrismaClient } from '../middleware/0.prisma'
import { getServerSession } from '#auth'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(event: H3Event) {
  return {
    session: await getServerSession(event),
    prisma: event.context.prisma as ExtendedPrismaClient,
    event
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
