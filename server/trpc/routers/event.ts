import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'

const defaultEventInclude = {
  account: true,
}

export const router = createRouter({
  findManyEvent: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.event.findMany({ ...input, include: defaultEventInclude, orderBy: { createdAt: 'desc' } })
  }),
})
