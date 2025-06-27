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
    const relation = await ctx.prisma.caretakerRelation.create({ data: input, select: { id: true, patientId: true, caretaker: { select: { id: true, name: true } } } })

    await ctx.prisma.event.create({
      data: {
        type: 'CaretakerRelationCreated',
        message: `New Caretaker Relation request: Do you accept ${relation.caretaker.name} as your caretaker?`,
        key: `caretakerRelation:${relation.id},${relation.caretaker.id},${relation.patientId},${new Date().toISOString()}`,
        accountId: relation.patientId,
        caretakerRelationId: relation.id,
      },
    })

    return relation
  }

  ),
  confirm: shieldedProcedure.input(z.object({ id: z.string() }).passthrough()).mutation(async ({ input, ctx }) => {
    return ctx.prisma.caretakerRelation.update({
      where: { id: input.id, patientId: ctx.session?.user.id },
      data: { isConfirmed: true },
    })
  }),
})
