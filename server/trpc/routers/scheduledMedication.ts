import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { updateScheduledMedicationTakenSchema } from '~/schemas'

const defaultInclude = {
  medication: {
    include: {
      account: {
        select: {
          name: true,
          email: true
        }
      }
    }
  }
}

const createScheduledMedicationSchema = z.object({
  medicationId: z.string(),
  scheduledAt: z.string().transform(str => new Date(str)),
})

export const router = createRouter({
  findManyMedication: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.scheduledMedication.findMany({ ...input, include: defaultInclude, orderBy: { createdAt: 'desc' } })
  }),
  findNextDose: shieldedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.scheduledMedication.findFirst({
      where: {
        scheduledAt: { gte: new Date() },
        taken: false,
        medication: { accountId: ctx.session?.user.id },
      },
      include: defaultInclude,
      orderBy: { scheduledAt: 'asc' },
    })
  }),
  create: shieldedProcedure.input(createScheduledMedicationSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.scheduledMedication.create({
      data: input,
      include: defaultInclude,
    })
  }),
  updateTaken: shieldedProcedure.input(updateScheduledMedicationTakenSchema).mutation(async ({ input, ctx }) => {
    return ctx.prisma.scheduledMedication.update({
      where: { id: input.id },
      data: { taken: input.taken },
    })
  }),
})
