import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { createCaretakerRelationSchema } from '~/schemas'

const defaultInclude = {
  caretaker: true,
  patient: true,
}

export const router = createRouter({
  findManyCaretakerRelations: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) =>
    ctx.prisma.caretakerRelation.findMany({ ...input, include: defaultInclude })
  ),
  findOneCaretakerRelations: shieldedProcedure.input(z.object({ id: z.string() }).passthrough()).query(({ input, ctx }) =>
    ctx.prisma.caretakerRelation.findUniqueOrThrow({ where: input, include: defaultInclude })
  ),
  create: shieldedProcedure.input(createCaretakerRelationSchema).mutation(async ({ input, ctx }) => {
    const patient = await ctx.prisma.account.findUnique({ where: { id: input.patientId, role: 'user' } })
    const caretaker = await ctx.prisma.account.findUnique({ where: { id: input.caretakerId, role: 'caretaker' } })

    if (!patient || !caretaker) {
      throw new Error('Invalid patient or caretaker ID')
    }

    // Check if relation already exists
    const existingRelation = await ctx.prisma.caretakerRelation.findFirst({
      where: {
        patientId: input.patientId,
        caretakerId: input.caretakerId,
      },
      select: { id: true, patientId: true, caretaker: { select: { id: true, name: true } } }
    })

    if (existingRelation) {
      // Return existing relation instead of creating a duplicate
      return existingRelation
    }

    const relation = await ctx.prisma.caretakerRelation.create({ data: input, select: { id: true, patientId: true, caretaker: { select: { id: true, name: true } } } })

    await ctx.prisma.event.create({
      data: {
        type: 'CaretakerRelationCreated',
        message: `${relation.caretaker.name} has requested to be your caretaker.`,
        key: `CaretakerRelationCreated:${relation.id},${relation.caretaker.id},${relation.patientId},${new Date().toISOString()}`,
        accountId: relation.patientId,
        caretakerRelationId: relation.id,
      },
    })

    return relation
  }),
  confirm: shieldedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ input, ctx }) => {
    const relation = await ctx.prisma.caretakerRelation.findUnique({ where: input, select: { id: true, patientId: true, caretaker: { select: { id: true, name: true } } } })

    if (!relation) {
      throw new Error('Caretaker relation not found')
    }

    await ctx.prisma.event.create({
      data: {
        type: 'CaretakerRelationConfirmed',
        message: `You have confirmed ${relation.caretaker.name} to be your caretaker.`,
        key: `CaretakerRelationConfirmed:${relation.id},${relation.caretaker.id},${relation.patientId},${new Date().toISOString()}`,
        accountId: relation.patientId,
        caretakerRelationId: relation.id,
      },
    })

    return ctx.prisma.caretakerRelation.update({
      where: { id: input.id, patientId: ctx.session?.user.id },
      data: { isConfirmed: true },
    })
  }),
  delete: shieldedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ input, ctx }) => {
    return ctx.prisma.caretakerRelation.delete({
      where: { id: input.id, OR: [{ patientId: ctx.session?.user.id }, { caretakerId: ctx.session?.user.id }] },
    })
  }),
})
