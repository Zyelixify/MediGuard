export interface TimingPreference {
  id: string
  accountId: string
  quarter: string
  preferredTime: string
  totalTaken: number
  averageDelay: number
  lastAdjusted?: Date
}

export interface DataQuality {
  quality: string
  message: string
  color: string
}

export interface FormattedTimingPreference extends TimingPreference {
  quarterLabel: string
  delayText: string
}

export const QUARTER_LABELS: Record<string, string> = {
  morning: 'Morning (6 AM - 12 PM)',
  afternoon: 'Afternoon (12 PM - 6 PM)',
  evening: 'Evening (6 PM - 12 AM)',
  night: 'Night (12 AM - 6 AM)'
}

export function formatTimingPreference(preference: TimingPreference): FormattedTimingPreference {
  return {
    ...preference,
    quarterLabel: QUARTER_LABELS[preference.quarter] || preference.quarter,
    delayText: preference.averageDelay > 0
      ? `Usually ${preference.averageDelay} min late`
      : preference.averageDelay < 0
        ? `Usually ${Math.abs(preference.averageDelay)} min early`
        : 'Usually on time'
  }
}

export function isTimingAdjustmentNeeded(preference: TimingPreference): boolean {
  return preference.totalTaken >= 3 && Math.abs(preference.averageDelay) > 15
}

export function getAdjustmentSuggestion(preference: TimingPreference): string {
  if (!isTimingAdjustmentNeeded(preference)) {
    return ''
  }

  const adjustMinutes = Math.round(preference.averageDelay * 0.25)
  if (adjustMinutes === 0) {
    return ''
  }

  return `Scheduling time adjusted to be ${Math.abs(adjustMinutes)} minutes ${adjustMinutes > 0 ? 'later' : 'earlier'}`
}

export function getDataQuality(preference: TimingPreference): DataQuality {
  if (preference.totalTaken < 3) {
    return {
      quality: 'Insufficient',
      message: 'Need more data points for reliable insights',
      color: 'gray'
    }
  }

  if (preference.totalTaken >= 10) {
    return {
      quality: 'Excellent',
      message: 'High confidence in timing patterns',
      color: 'green'
    }
  }

  if (preference.totalTaken >= 5) {
    return {
      quality: 'Good',
      message: 'Reliable timing insights available',
      color: 'blue'
    }
  }

  return {
    quality: 'Fair',
    message: 'Basic insights available, improving with more data',
    color: 'yellow'
  }
}

export function getTimingConcerns(preference: TimingPreference): string[] {
  const concerns: string[] = []

  if (Math.abs(preference.averageDelay) > 60) {
    concerns.push('Consistently off schedule by over 1 hour')
  }

  if (preference.averageDelay > 30) {
    concerns.push('Frequently taking medications late')
  }

  if (preference.averageDelay < -30) {
    concerns.push('Often taking medications very early')
  }

  return concerns
}

export function getTimingSummary(preferences: TimingPreference[]) {
  if (preferences.length === 0) {
    return {
      totalDataPoints: 0,
      averageAccuracy: 0,
      mostProblematicQuarter: null,
      overallQuality: 'No data'
    }
  }

  const totalDataPoints = preferences.reduce((sum, p) => sum + p.totalTaken, 0)
  const averageAccuracy = preferences.reduce((sum, p) => sum + Math.abs(p.averageDelay), 0) / preferences.length

  const worstPreference = preferences.reduce((worst, current) =>
    Math.abs(current.averageDelay) > Math.abs(worst.averageDelay) ? current : worst
  )

  let overallQuality = 'Poor'
  if (totalDataPoints >= 20 && averageAccuracy < 15) {
    overallQuality = 'Excellent'
  }
  else if (totalDataPoints >= 10 && averageAccuracy < 30) {
    overallQuality = 'Good'
  }
  else if (totalDataPoints >= 5) {
    overallQuality = 'Fair'
  }

  return {
    totalDataPoints,
    averageAccuracy: Math.round(averageAccuracy),
    mostProblematicQuarter: QUARTER_LABELS[worstPreference.quarter] || worstPreference.quarter,
    overallQuality
  }
}
