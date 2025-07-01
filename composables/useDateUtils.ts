/**
 * Date and time utility functions for the application
 */
export function useDateUtils() {
  /**
   * Format the time difference between now and a scheduled date
   * Returns human-readable relative time like "in 2h 30m" or "Overdue"
   */
  function formatScheduledTime(date: Date): string {
    const now = new Date()
    const scheduled = new Date(date)
    const diffMs = scheduled.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffMs < 0) {
      return 'Overdue'
    }
    if (diffHours === 0) {
      return `in ${diffMinutes}m`
    }
    if (diffHours < 24) {
      return `in ${diffHours}h ${diffMinutes}m`
    }

    const diffDays = Math.floor(diffHours / 24)
    return `in ${diffDays}d ${diffHours % 24}h`
  }

  /**
   * Format a date/time for display in a user-friendly format
   * Returns format like "Mon, Jul 2, 3:30 PM"
   */
  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Format a date for display without time
   * Returns format like "Monday, July 2, 2025"
   */
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Format time only
   * Returns format like "3:30 PM"
   */
  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Get relative time difference in a more detailed format
   * Returns object with days, hours, minutes for more granular control
   */
  function getTimeDifference(date: Date): {
    isPast: boolean
    days: number
    hours: number
    minutes: number
    totalMinutes: number
  } {
    const now = new Date()
    const target = new Date(date)
    const diffMs = target.getTime() - now.getTime()
    const isPast = diffMs < 0
    const absDiffMs = Math.abs(diffMs)

    const totalMinutes = Math.floor(absDiffMs / (1000 * 60))
    const minutes = totalMinutes % 60
    const totalHours = Math.floor(absDiffMs / (1000 * 60 * 60))
    const hours = totalHours % 24
    const days = Math.floor(totalHours / 24)

    return {
      isPast,
      days,
      hours,
      minutes,
      totalMinutes,
    }
  }

  return {
    formatScheduledTime,
    formatDateTime,
    formatDate,
    formatTime,
    getTimeDifference,
  }
}
