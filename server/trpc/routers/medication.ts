import { z } from 'zod'
import { addDays, addMonths, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'
import { shieldedProcedure } from '../procedures'
import { createRouter } from '~/server/trpc/trpc'
import { createMedicationSchema } from '~/schemas'
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
        accountId: medication.accountId,
      },
    })

    // Create all scheduled medications for the selected period
    const scheduledDates = getScheduledDatesFromMedication(input)

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

function getScheduledDatesFromMedication(input: MedicationCreationFormData) {
  const startDate = new Date(input.startDate)
  const endDate = new Date(input.endDate)
  const scheduledDates: Date[] = []

  const frequencyConfig = {
    daily: {
      'Once a day': ['09:00'],
      'Twice a day': ['09:00', '21:00'],
      'Three times a day': ['09:00', '15:00', '21:00'],
      'Four times a day': ['09:00', '13:00', '17:00', '21:00'],
    },
    weekly: {
      'Once a week': 7,
      'Twice a week': 3,
      'Three times a week': 2,
      'Four times a week': 1,
    },
    monthly: {
      'Once a month': 1,
    }
  } as const

  const createScheduledTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
  }

  if (input.frequency.includes('day')) {
    const dailyTimes = frequencyConfig.daily[input.frequency as keyof typeof frequencyConfig.daily] || ['09:00']
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
    const dayInterval = frequencyConfig.weekly[input.frequency as keyof typeof frequencyConfig.weekly] || 7
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const scheduledDate = createScheduledTime(currentDate, '09:00')
      scheduledDates.push(scheduledDate)
      currentDate = addDays(currentDate, dayInterval)
    }
  }
  else if (input.frequency.includes('month')) {
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const scheduledDate = createScheduledTime(currentDate, '09:00')
      scheduledDates.push(scheduledDate)
      currentDate = addMonths(currentDate, 1)
    }
  }

  return scheduledDates
}
