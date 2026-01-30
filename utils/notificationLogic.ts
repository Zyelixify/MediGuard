export function generateTTSMessage(
  type: 'dose' | 'overdue',
  medicationName: string,
  dosage?: string,
  overdueTime?: string
): string {
  if (type === 'dose') {
    return `Medication reminder: It's time to take your ${medicationName}${dosage ? ` ${dosage}` : ''}.`
  }
  else {
    return `Overdue medication alert: Your ${medicationName}${dosage ? ` ${dosage}` : ''} is overdue${overdueTime ? ` by ${overdueTime}` : ''}.`
  }
}

export function calculateOverdueTime(scheduledAt: Date | string, now: Date = new Date()): string {
  const scheduledTime = new Date(scheduledAt)

  if (now <= scheduledTime) {
    return ''
  }

  const diffMs = now.getTime() - scheduledTime.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
  }
  else {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  }
}

export function shouldTriggerNotification(
  scheduledAt: Date | string,
  now: Date = new Date(),
  toleranceMs: number = 60000 // 1 minute
): boolean {
  const scheduledTime = new Date(scheduledAt)
  const timeDiff = scheduledTime.getTime() - now.getTime()

  return timeDiff <= toleranceMs && timeDiff >= 0
}

export function formatNotificationTitle(type: 'dose' | 'overdue'): string {
  return type === 'dose' ? '💊 Medication Reminder' : '🚨 Overdue Medication'
}

export function formatNotificationBody(
  type: 'dose' | 'overdue',
  medicationName: string,
  dosage: string,
  timeInfo: string // scheduledTime formatted or overdue string
): string {
  if (type === 'dose') {
    return `Time to take ${medicationName} (${dosage}) - scheduled for ${timeInfo}`
  }
  else {
    return `${medicationName} (${dosage}) is overdue by ${timeInfo}`
  }
}
