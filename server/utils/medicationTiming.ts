import { addMinutes, format, getHours } from 'date-fns'
import type { ExtendedPrismaClient } from '~/server/middleware/0.prisma'
import type { FrequencyType } from '~/types'

export type Quarter = 'morning' | 'afternoon' | 'evening' | 'night'

export const DEFAULT_TIMES: Record<Quarter, string> = {
  morning: '09:00',
  afternoon: '15:00',
  evening: '21:00',
  night: '03:00'
}

export const QUARTER_HOURS: Record<Quarter, [number, number]> = {
  morning: [6, 11],
  afternoon: [12, 17],
  evening: [18, 23],
  night: [0, 5]
}

/**
 * Determines which quarter of the day a time falls into
 */
export function getTimeQuarter(date: Date): Quarter {
  const hour = getHours(date)

  if (hour >= 6 && hour <= 11) {
    return 'morning'
  }
  if (hour >= 12 && hour <= 17) {
    return 'afternoon'
  }
  if (hour >= 18 && hour <= 23) {
    return 'evening'
  }
  return 'night'
}

/**
 * Adjusts a time based on delay patterns, keeping within quarter bounds
 */
export function adjustTime(currentTime: string, delayMinutes: number, quarter: Quarter): string {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number)
  const currentDate = new Date()
  currentDate.setHours(currentHour, currentMinute, 0, 0)

  // Adjust by 25% of the average delay
  const adjustmentMinutes = Math.round(delayMinutes * 0.25)
  const adjustedDate = addMinutes(currentDate, adjustmentMinutes)

  // Keep within quarter bounds
  const [minHour, maxHour] = QUARTER_HOURS[quarter]
  const adjustedHour = Math.max(minHour, Math.min(maxHour, adjustedDate.getHours()))
  const adjustedMinute = adjustedDate.getMinutes()

  return format(new Date().setHours(adjustedHour, adjustedMinute, 0, 0), 'HH:mm')
}

/**
 * Records medication timing for learning user preferences
 */
export async function recordMedicationTiming(
  prisma: ExtendedPrismaClient,
  accountId: string,
  scheduledAt: Date,
  takenAt: Date
) {
  const delayMinutes = Math.round((takenAt.getTime() - scheduledAt.getTime()) / (1000 * 60))
  const quarter = getTimeQuarter(scheduledAt)

  if (Math.abs(delayMinutes) > 120) {
    return
  }

  const existingPreference = await prisma.medicationTimingPreference.findUnique({
    where: {
      accountId_quarter: {
        accountId,
        quarter
      }
    }
  })

  if (existingPreference) {
    const newTotal = existingPreference.totalTaken + 1
    const newAverage = Math.round(
      (existingPreference.averageDelay * existingPreference.totalTaken + delayMinutes) / newTotal
    )

    let newPreferredTime = existingPreference.preferredTime
    if (newTotal >= 3 && Math.abs(newAverage) >= 15) {
      newPreferredTime = adjustTime(existingPreference.preferredTime, newAverage, quarter)
    }

    await prisma.medicationTimingPreference.update({
      where: { id: existingPreference.id },
      data: {
        totalTaken: newTotal,
        averageDelay: newAverage,
        preferredTime: newPreferredTime
      }
    })
  }
  else {
    await prisma.medicationTimingPreference.create({
      data: {
        accountId,
        quarter,
        preferredTime: DEFAULT_TIMES[quarter],
        totalTaken: 1,
        averageDelay: delayMinutes
      }
    })
  }
}

/**
 * Gets personalized times based on quarter-based learned preferences
 */
export async function getPersonalizedTimesForFrequency(
  prisma: ExtendedPrismaClient,
  accountId: string
): Promise<Record<Quarter, string>> {
  const preferences = await prisma.medicationTimingPreference.findMany({ where: { accountId } })

  // Build result with defaults
  const result: Record<Quarter, string> = { ...DEFAULT_TIMES }

  for (const preference of preferences) {
    result[preference.quarter as Quarter] = preference.preferredTime
  }

  return result
}

/**
 * Get default schedule times for different medication frequencies
 */
export function getDefaultScheduleForFrequency(frequency: FrequencyType): string[] {
  const frequencyConfig: Record<FrequencyType, string[]> = {
    'Once a day': [DEFAULT_TIMES.morning],
    'Twice a day': [DEFAULT_TIMES.morning, DEFAULT_TIMES.evening],
    'Three times a day': [DEFAULT_TIMES.morning, DEFAULT_TIMES.afternoon, DEFAULT_TIMES.evening],
    'Four times a day': [DEFAULT_TIMES.morning, DEFAULT_TIMES.afternoon, DEFAULT_TIMES.evening, DEFAULT_TIMES.night],
    'Once a week': [DEFAULT_TIMES.morning],
    'Twice a week': [DEFAULT_TIMES.morning],
    'Three times a week': [DEFAULT_TIMES.morning],
  }

  return frequencyConfig[frequency] || [DEFAULT_TIMES.morning]
}
