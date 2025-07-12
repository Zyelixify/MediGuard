import { z } from 'zod'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { DEFAULT_TIMES, type Quarter, getPersonalizedTimesForFrequency } from '~/server/utils/medicationTiming'

export const router = createRouter({
  getTimingPreferences: shieldedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.medicationTimingPreference.findMany({
        where: {
          accountId: ctx.session!.user.id
        },
        orderBy: [
          { quarter: 'asc' }
        ]
      })
    }),
  getPersonalizedSchedule: shieldedProcedure
    .query(async ({ ctx }) => {
      const personalizedTimes = await getPersonalizedTimesForFrequency(
        ctx.prisma,
        ctx.session!.user.id
      )

      return personalizedTimes
    }),
  simulateTimingScenarios: shieldedProcedure
    .input(z.object({
      scenario: z.enum(['consistently_late', 'wildly_overdue', 'consistently_early', 'reset'])
    }))
    .mutation(async ({ input, ctx }) => {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('This endpoint is only available in development')
      }

      const accountId = ctx.session!.user.id
      const quarter: Quarter = 'morning'

      switch (input.scenario) {
        case 'consistently_late':
          await ctx.prisma.medicationTimingPreference.upsert({
            where: { accountId_quarter: { accountId, quarter } },
            create: {
              accountId,
              quarter,
              preferredTime: '09:10',
              totalTaken: 6,
              averageDelay: 40
            },
            update: {
              preferredTime: '09:10',
              totalTaken: 6,
              averageDelay: 40
            }
          })
          break

        case 'wildly_overdue':
          await ctx.prisma.medicationTimingPreference.upsert({
            where: { accountId_quarter: { accountId, quarter } },
            create: {
              accountId,
              quarter,
              preferredTime: DEFAULT_TIMES[quarter],
              totalTaken: 2,
              averageDelay: 5
            },
            update: {
              preferredTime: DEFAULT_TIMES[quarter],
              totalTaken: 2,
              averageDelay: 5
            }
          })
          break

        case 'consistently_early':
          await ctx.prisma.medicationTimingPreference.upsert({
            where: { accountId_quarter: { accountId, quarter } },
            create: {
              accountId,
              quarter,
              preferredTime: '08:52',
              totalTaken: 10,
              averageDelay: -30
            },
            update: {
              preferredTime: '08:52',
              totalTaken: 10,
              averageDelay: -30
            }
          })
          break

        case 'reset':
          await ctx.prisma.medicationTimingPreference.deleteMany({
            where: {
              accountId
            }
          })
          break
      }

      return { success: true, scenario: input.scenario }
    })
})
