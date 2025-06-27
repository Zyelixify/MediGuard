import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'

const defaultSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
}

export const router = createRouter({
  findManyAccount: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => ctx.prisma.account.findMany({ ...input, select: defaultSelect })),
  findOneAccount: shieldedProcedure.input(z.object({ email: z.string() }).passthrough()).query(({ input, ctx }) => ctx.prisma.account.findUniqueOrThrow({ where: input, select: defaultSelect })),
})
