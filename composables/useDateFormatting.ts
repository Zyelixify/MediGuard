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

  function formatTimeUntilRealTime(scheduledAt: Date | string, currentTime: Date): string {
    const targetDate = new Date(scheduledAt)
    const timeDiff = targetDate.getTime() - currentTime.getTime()

    if (timeDiff <= 0) {
      const distance = formatDistanceToNowStrict(targetDate, { addSuffix: true })
      return distance.replace('ago', 'overdue')
    }

    return formatDistanceToNowStrict(targetDate, { addSuffix: true })
  }

  function isDoseOverdueRealTime(scheduledAt: Date | string, currentTime: Date): boolean {
    const targetDate = new Date(scheduledAt)
    return currentTime.getTime() > targetDate.getTime()
  }

  function isDoseTimeNowRealTime(scheduledAt: Date | string, currentTime: Date, tolerance = 30000): boolean {
    const targetDate = new Date(scheduledAt)
    const timeDiff = Math.abs(currentTime.getTime() - targetDate.getTime())
    return timeDiff <= tolerance
  }

  // Real-time countdown composable
  function useRealTimeCountdown(scheduledAt: Ref<Date | string | null>) {
    const currentTime = ref(new Date())
    const countdownInterval = ref<NodeJS.Timeout | null>(null)

    // Start countdown timer
    function startCountdown() {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }

      countdownInterval.value = setInterval(() => {
        currentTime.value = new Date()
      }, 1000)
    }

    function stopCountdown() {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
    }

    const timeUntil = computed(() => {
      if (!scheduledAt.value) {
        return ''
      }
      return formatTimeUntilRealTime(scheduledAt.value, currentTime.value)
    })

    const isOverdue = computed(() => {
      if (!scheduledAt.value) {
        return false
      }
      return isDoseOverdueRealTime(scheduledAt.value, currentTime.value)
    })

    const isDoseTimeNow = computed(() => {
      if (!scheduledAt.value) {
        return false
      }
      return isDoseTimeNowRealTime(scheduledAt.value, currentTime.value)
    })

    const formattedTime = computed(() => {
      if (!scheduledAt.value) {
        return ''
      }
      return formatTime12Hour(scheduledAt.value)
    })

    const formattedDate = computed(() => {
      if (!scheduledAt.value) {
        return ''
      }
      return formatDateDisplay(scheduledAt.value)
    })

    onMounted(() => {
      if (scheduledAt.value) {
        startCountdown()
      }
    })

    onUnmounted(() => {
      stopCountdown()
    })

    watch(scheduledAt, (newScheduledAt) => {
      if (newScheduledAt) {
        startCountdown()
      }
      else {
        stopCountdown()
      }
    }, { immediate: true })

    return {
      currentTime: readonly(currentTime),
      timeUntil,
      isOverdue,
      isDoseTimeNow,
      formattedTime,
      formattedDate,
      startCountdown,
      stopCountdown
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
    formatTimeUntilRealTime,
    isDoseOverdueRealTime,
    isDoseTimeNowRealTime,
    useRealTimeCountdown,
  }
}
