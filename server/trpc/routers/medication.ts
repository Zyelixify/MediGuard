import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { createMedicationSchema } from '~/schemas'

const defaultInclude = {
  account: true,
  scheduledMedications: true
}

export const router = createRouter({
  findManyMedication: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.medication.findMany({ ...input, include: defaultInclude, orderBy: { createdAt: 'desc' } })
  }),
  createMedication: shieldedProcedure.input(createMedicationSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.medication.create({
      data: input,
      include: defaultInclude,
    })
  }),
})
