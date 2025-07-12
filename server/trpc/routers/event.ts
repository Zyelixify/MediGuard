import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'

export const router = createRouter({
  findManyEvent: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.event.findMany({ ...input, orderBy: { timestamp: 'desc' } })
  }),
})
