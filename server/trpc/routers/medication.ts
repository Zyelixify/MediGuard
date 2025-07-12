import { z } from 'zod'
import { addDays, addMonths, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { createMedicationSchema } from '~/schemas'
import { getDefaultScheduleForFrequency, getPersonalizedTimesForFrequency } from '~/server/utils/medicationTiming'
import type { MedicationCreationFormData } from '~/types'

const defaultInclude = {
  account: true,
  scheduledMedications: true
}

export const router = createRouter({
  findManyMedication: shieldedProcedure.input(z.object({}).passthrough()).query(({ input, ctx }) => {
    return ctx.prisma.medication.findMany({ ...input, include: defaultInclude, orderBy: { createdAt: 'desc' } })
  }),
  createMedication: shieldedProcedure.input(createMedicationSchema).mutation(async ({ input, ctx }) => {
    const medication = await ctx.prisma.medication.create({
      data: input,
      include: defaultInclude,
    })

    // Create an event for the medication creation
    await ctx.prisma.event.create({
      data: {
        type: 'MedicationCreated',
        message: `Medication ${medication.name} has been created by ${ctx.session?.user.name ?? 'Unknown User'}.`,
        key: `MedicationCreated:${medication.id},${medication.accountId},${new Date().toISOString()}`,
        accounts: {
          connect: [
            { id: medication.accountId },
            ...(ctx.session?.user.id === medication.accountId ? [] : [{ id: ctx.session?.user.id }])
          ]
        },
      },
    })

    // Create all scheduled medications for the selected period using personalized timing
    const scheduledDates = await getScheduledDatesFromMedication(input, ctx.prisma, ctx.session?.user.id)

    const scheduledMedications = scheduledDates.map(date => ({
      medicationId: medication.id,
      scheduledAt: date,
      taken: false,
    }))

    if (scheduledMedications.length > 0) {
      await ctx.prisma.scheduledMedication.createMany({
        data: scheduledMedications,
      })
    }

    return medication
  }),
})

async function getScheduledDatesFromMedication(input: MedicationCreationFormData, prisma: any, userId?: string) {
  const startDate = new Date(input.startDate)
  const endDate = new Date(input.endDate)
  const scheduledDates: Date[] = []

  // Get personalized times for this frequency if user is provided
  let dailyTimes: string[]
  if (userId) {
    const personalizedTimes = await getPersonalizedTimesForFrequency(prisma, userId)
    // Convert to array format for daily medications
    dailyTimes = Object.values(personalizedTimes)
  }
  else {
    dailyTimes = getDefaultScheduleForFrequency(input.frequency)
  }

  const createScheduledTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
  }

  if (input.frequency.includes('day')) {
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      for (const time of dailyTimes) {
        const scheduledDate = createScheduledTime(currentDate, time)
        scheduledDates.push(scheduledDate)
      }
      currentDate = addDays(currentDate, 1)
    }
  }
  else if (input.frequency.includes('week')) {
    const frequencyConfig = {
      'Once a week': 7,
      'Twice a week': 3,
      'Three times a week': 2,
    }

    const dayInterval = frequencyConfig[input.frequency as keyof typeof frequencyConfig] || 7
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const scheduledDate = createScheduledTime(currentDate, dailyTimes[0] || '09:00')
      scheduledDates.push(scheduledDate)
      currentDate = addDays(currentDate, dayInterval)
    }
  }
  else if (input.frequency.includes('month')) {
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const scheduledDate = createScheduledTime(currentDate, dailyTimes[0] || '09:00')
      scheduledDates.push(scheduledDate)
      currentDate = addMonths(currentDate, 1)
    }
  }

  return scheduledDates
}
