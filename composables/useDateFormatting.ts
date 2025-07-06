import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  formatDistanceToNowStrict,
  isPast,
  isToday,
  isTomorrow,
  isYesterday
} from 'date-fns'

export function useDateFormatting() {
  function formatTimeUntil(date: Date | string, replaceAgo = true): string {
    const targetDate = new Date(date)

    // Check if the date is in the past (overdue)
    if (isPast(targetDate) && replaceAgo) {
      const distance = formatDistanceToNowStrict(targetDate, { addSuffix: true })
      return distance.replace('ago', 'overdue')
    }

    // Future date
    return formatDistanceToNowStrict(targetDate, { addSuffix: true })
  }

  function formatTimeUntilCompact(date: Date | string): string {
    const targetDate = new Date(date)
    const now = new Date()

    const isOverdue = isPast(targetDate)
    const minutesDiff = Math.abs(differenceInMinutes(targetDate, now))
    const hoursDiff = Math.abs(differenceInHours(targetDate, now))
    const daysDiff = Math.abs(differenceInDays(targetDate, now))

    let result = ''

    if (daysDiff > 0) {
      result = `${daysDiff}d`
    }
    else if (hoursDiff > 0) {
      const remainingMinutes = minutesDiff % 60
      result = remainingMinutes > 0 ? `${hoursDiff}h ${remainingMinutes}m` : `${hoursDiff}h`
    }
    else {
      result = `${minutesDiff}m`
    }

    return isOverdue ? `${result} overdue` : `in ${result}`
  }

  function formatDateDisplay(date: Date | string): string {
    const targetDate = new Date(date)

    if (isToday(targetDate)) {
      return 'Today'
    }
    else if (isTomorrow(targetDate)) {
      return 'Tomorrow'
    }
    else if (isYesterday(targetDate)) {
      return 'Yesterday'
    }
    else {
      return format(targetDate, 'EEE, MMM d')
    }
  }

  function formatTime12Hour(date: Date | string): string {
    const targetDate = new Date(date)
    return format(targetDate, 'h:mm a')
  }

  function formatFullDateTime(date: Date | string): string {
    const targetDate = new Date(date)
    return format(targetDate, 'MMM d, yyyy \'at\' h:mm a')
  }

  function formatMedicationDate(date: Date | string): string {
    const targetDate = new Date(date)
    return format(targetDate, 'MMM d, yyyy')
  }

  function isDoseOverdue(scheduledAt: Date | string): boolean {
    return isPast(new Date(scheduledAt))
  }

  function getDoseStatus(scheduledAt: Date | string): 'overdue' | 'today' | 'upcoming' {
    const targetDate = new Date(scheduledAt)

    if (isPast(targetDate)) {
      return 'overdue'
    }
    else if (isToday(targetDate)) {
      return 'today'
    }
    else {
      return 'upcoming'
    }
  }

  return {
    formatTimeUntil,
    formatTimeUntilCompact,
    formatDateDisplay,
    formatTime12Hour,
    formatFullDateTime,
    formatMedicationDate,
    isDoseOverdue,
    getDoseStatus,
  }
}
