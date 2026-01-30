import { addDays, addMonths, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns'

export function calculateScheduledDates(
  startDate: Date | string,
  endDate: Date | string,
  frequency: string,
  dailyTimes: string[]
): Date[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const scheduledDates: Date[] = []

  const createScheduledTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
  }

  if (frequency.includes('day')) {
    let currentDate = new Date(start)

    while (currentDate <= end) {
      for (const time of dailyTimes) {
        const scheduledDate = createScheduledTime(currentDate, time)
        // Ensure we don't schedule in the past relative to start date time
        // (Though typically start date is just a date, if it has time components we might care)
        // The original logic didn't check this, it just iterated days.
        // We will keep original behavior: iterate days from start to end.
        scheduledDates.push(scheduledDate)
      }
      currentDate = addDays(currentDate, 1)
    }
  }
  else if (frequency.includes('week')) {
    const frequencyConfig: Record<string, number> = {
      'Once a week': 7,
      'Twice a week': 3,
      'Three times a week': 2, // Note: Logic from original file. 2 days -> 3.5 times a week? "Three times a week" roughly every 2 days?
      // The original code used 2.
    }

    const dayInterval = frequencyConfig[frequency] || 7
    let currentDate = new Date(start)

    while (currentDate <= end) {
      // For weekly, it seems to take the first dailyTime or default to 09:00
      const time = dailyTimes[0] || '09:00'
      const scheduledDate = createScheduledTime(currentDate, time)
      scheduledDates.push(scheduledDate)
      currentDate = addDays(currentDate, dayInterval)
    }
  }
  else if (frequency.includes('month')) {
    let currentDate = new Date(start)

    while (currentDate <= end) {
      const time = dailyTimes[0] || '09:00'
      const scheduledDate = createScheduledTime(currentDate, time)
      scheduledDates.push(scheduledDate)
      currentDate = addMonths(currentDate, 1)
    }
  }

  return scheduledDates
}
