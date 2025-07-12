import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { updateScheduledMedicationTakenSchema } from '~/schemas'
import { recordMedicationTiming } from '~/server/utils/medicationTiming'

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
    const takenAt = input.takenAt || new Date()

    // First get the current medication info
    const currentMedication = await ctx.prisma.scheduledMedication.findUnique({
      where: { id: input.id },
      include: {
        medication: true
      }
    })

    if (!currentMedication) {
      throw new Error('Scheduled medication not found')
    }

    const updatedMedication = await ctx.prisma.scheduledMedication.update({
      where: { id: input.id },
      data: {
        taken: input.taken,
        takenAt: input.taken ? takenAt : null,
      }
    })

    // If medication is being marked as taken, record timing for learning
    if (input.taken && currentMedication.medication) {
      await recordMedicationTiming(
        ctx.prisma,
        ctx.session!.user.id,
        currentMedication.scheduledAt,
        takenAt
      )
    }

    return updatedMedication
  }),
})
