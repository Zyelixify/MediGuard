import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { updateScheduledMedicationTakenSchema } from '~/schemas'

const defaultInclude = {
  medication: true,
}

export const router = createRouter({
  findManyMedication: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.scheduledMedication.findMany({ ...input, include: defaultInclude, orderBy: { createdAt: 'desc' } })
  }),
  updateTaken: shieldedProcedure.input(updateScheduledMedicationTakenSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.scheduledMedication.update({
      where: { id: input.id },
      data: { taken: input.taken },
    })
  }),
})
