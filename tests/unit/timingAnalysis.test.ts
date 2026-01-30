import { describe, expect, it } from 'vitest'
import {
  formatTimingPreference,
  getAdjustmentSuggestion,
  getDataQuality,
  getTimingConcerns,
  getTimingSummary,
  isTimingAdjustmentNeeded,
} from '~/utils/timingAnalysis'
import {
  getDefaultScheduleForFrequency,
  getTimeQuarter,
} from '~/server/utils/medicationTiming'
import type { TimingPreference } from '~/utils/timingAnalysis'

describe('timingAnalysis', () => {
  describe('getTimeQuarter', () => {
    it('should return "night" for hours 0-5', () => {
      expect(getTimeQuarter(new Date('2026-01-30T00:00:00'))).toBe('night')
      expect(getTimeQuarter(new Date('2026-01-30T05:00:00'))).toBe('night')
    })

    it('should return "morning" for hours 6-11', () => {
      expect(getTimeQuarter(new Date('2026-01-30T06:00:00'))).toBe('morning')
      expect(getTimeQuarter(new Date('2026-01-30T09:00:00'))).toBe('morning')
      expect(getTimeQuarter(new Date('2026-01-30T11:00:00'))).toBe('morning')
    })

    it('should return "afternoon" for hours 12-17', () => {
      expect(getTimeQuarter(new Date('2026-01-30T12:00:00'))).toBe('afternoon')
      expect(getTimeQuarter(new Date('2026-01-30T14:00:00'))).toBe('afternoon')
      expect(getTimeQuarter(new Date('2026-01-30T17:00:00'))).toBe('afternoon')
    })

    it('should return "evening" for hours 18-23', () => {
      expect(getTimeQuarter(new Date('2026-01-30T18:00:00'))).toBe('evening')
      expect(getTimeQuarter(new Date('2026-01-30T21:00:00'))).toBe('evening')
      expect(getTimeQuarter(new Date('2026-01-30T23:00:00'))).toBe('evening')
    })
  })

  describe('getDefaultScheduleForFrequency', () => {
    it('should return appropriate times for "Once a day"', () => {
      const times = getDefaultScheduleForFrequency('Once a day')
      expect(times).toEqual(['09:00'])
    })

    it('should return appropriate times for "Twice a day"', () => {
      const times = getDefaultScheduleForFrequency('Twice a day')
      expect(times).toEqual(['09:00', '21:00'])
    })

    it('should return appropriate times for "Three times a day"', () => {
      const times = getDefaultScheduleForFrequency('Three times a day')
      expect(times).toEqual(['09:00', '15:00', '21:00'])
    })

    it('should return appropriate times for "Four times a day"', () => {
      const times = getDefaultScheduleForFrequency('Four times a day')
      expect(times).toEqual(['09:00', '15:00', '21:00', '03:00'])
    })
  })

  describe('isTimingAdjustmentNeeded', () => {
    it('should return false if totalTaken < 3', () => {
      const preference: Partial<TimingPreference> = {
        totalTaken: 2,
        averageDelay: 30,
      }
      expect(isTimingAdjustmentNeeded(preference as TimingPreference)).toBe(false)
    })

    it('should return false if averageDelay <= 15', () => {
      const preference: Partial<TimingPreference> = {
        totalTaken: 10,
        averageDelay: 10,
      }
      expect(isTimingAdjustmentNeeded(preference as TimingPreference)).toBe(false)
    })

    it('should return true if totalTaken >= 3 and averageDelay > 15', () => {
      const preference: Partial<TimingPreference> = {
        totalTaken: 10,
        averageDelay: 25,
      }
      expect(isTimingAdjustmentNeeded(preference as TimingPreference)).toBe(true)
    })

    it('should return true if averageDelay < -15 (too early)', () => {
      const preference: Partial<TimingPreference> = {
        totalTaken: 5,
        averageDelay: -20,
      }
      expect(isTimingAdjustmentNeeded(preference as TimingPreference)).toBe(true)
    })
  })

  describe('getAdjustmentSuggestion', () => {
    it('should suggest later time for positive delay', () => {
      const preference: Partial<TimingPreference> = {
        id: 'test-1',
        accountId: 'acc-1',
        totalTaken: 10,
        averageDelay: 25,
        quarter: 'morning',
        preferredTime: '09:00',
      }
      const suggestion = getAdjustmentSuggestion(preference as TimingPreference)
      expect(suggestion).toContain('6 minutes later')
    })

    it('should suggest earlier time for negative delay', () => {
      const preference: Partial<TimingPreference> = {
        id: 'test-2',
        accountId: 'acc-1',
        totalTaken: 10,
        averageDelay: -20,
        quarter: 'morning',
        preferredTime: '09:00',
      }
      const suggestion = getAdjustmentSuggestion(preference as TimingPreference)
      expect(suggestion).toContain('5 minutes earlier')
    })

    it('should return empty string if adjustment not needed', () => {
      const preference: Partial<TimingPreference> = {
        id: 'test-3',
        accountId: 'acc-1',
        totalTaken: 5,
        averageDelay: 10,
        quarter: 'morning',
        preferredTime: '09:00',
      }
      const suggestion = getAdjustmentSuggestion(preference as TimingPreference)
      expect(suggestion).toBe('')
    })
  })

  describe('getDataQuality', () => {
    it('should return "Insufficient" if totalTaken < 3', () => {
      const preference: Partial<TimingPreference> = { totalTaken: 2 }
      const quality = getDataQuality(preference as TimingPreference)
      expect(quality.quality).toBe('Insufficient')
    })

    it('should return "Good" if totalTaken between 5 and 9', () => {
      const preference: Partial<TimingPreference> = { totalTaken: 7 }
      const quality = getDataQuality(preference as TimingPreference)
      expect(quality.quality).toBe('Good')
    })

    it('should return "Excellent" if totalTaken >= 10', () => {
      const preference: Partial<TimingPreference> = { totalTaken: 10 }
      const quality = getDataQuality(preference as TimingPreference)
      expect(quality.quality).toBe('Excellent')
    })
  })

  describe('formatTimingPreference', () => {
    it('should format preference with quarter label and delay text for late timing', () => {
      const preference: TimingPreference = {
        id: '1',
        accountId: 'user1',
        quarter: 'morning',
        preferredTime: '08:00',
        totalTaken: 10,
        averageDelay: 15
      }
      const formatted = formatTimingPreference(preference)
      expect(formatted.quarterLabel).toBe('Morning (6 AM - 12 PM)')
      expect(formatted.delayText).toBe('Usually 15 min late')
    })

    it('should format preference with early delay text', () => {
      const preference: TimingPreference = {
        id: '2',
        accountId: 'user1',
        quarter: 'evening',
        preferredTime: '18:00',
        totalTaken: 5,
        averageDelay: -10
      }
      const formatted = formatTimingPreference(preference)
      expect(formatted.quarterLabel).toBe('Evening (6 PM - 12 AM)')
      expect(formatted.delayText).toBe('Usually 10 min early')
    })

    it('should format preference with on-time text', () => {
      const preference: TimingPreference = {
        id: '3',
        accountId: 'user1',
        quarter: 'afternoon',
        preferredTime: '14:00',
        totalTaken: 8,
        averageDelay: 0
      }
      const formatted = formatTimingPreference(preference)
      expect(formatted.quarterLabel).toBe('Afternoon (12 PM - 6 PM)')
      expect(formatted.delayText).toBe('Usually on time')
    })
  })

  describe('getTimingConcerns', () => {
    it('should return concerns for large delays', () => {
      const preference: TimingPreference = {
        id: '1',
        accountId: 'user1',
        quarter: 'morning',
        preferredTime: '08:00',
        totalTaken: 10,
        averageDelay: 90
      }
      const concerns = getTimingConcerns(preference)
      expect(concerns).toContain('Consistently off schedule by over 1 hour')
      expect(concerns).toContain('Frequently taking medications late')
    })

    it('should return concerns for moderate late timing', () => {
      const preference: TimingPreference = {
        id: '2',
        accountId: 'user1',
        quarter: 'evening',
        preferredTime: '18:00',
        totalTaken: 5,
        averageDelay: 45
      }
      const concerns = getTimingConcerns(preference)
      expect(concerns).toContain('Frequently taking medications late')
      expect(concerns).not.toContain('Consistently off schedule by over 1 hour')
    })

    it('should return concerns for very early timing', () => {
      const preference: TimingPreference = {
        id: '3',
        accountId: 'user1',
        quarter: 'morning',
        preferredTime: '08:00',
        totalTaken: 8,
        averageDelay: -40
      }
      const concerns = getTimingConcerns(preference)
      expect(concerns).toContain('Often taking medications very early')
    })

    it('should return no concerns for good timing', () => {
      const preference: TimingPreference = {
        id: '4',
        accountId: 'user1',
        quarter: 'afternoon',
        preferredTime: '14:00',
        totalTaken: 10,
        averageDelay: 10
      }
      const concerns = getTimingConcerns(preference)
      expect(concerns).toHaveLength(0)
    })
  })

  describe('getTimingSummary', () => {
    it('should return no data summary for empty preferences', () => {
      const summary = getTimingSummary([])
      expect(summary.totalDataPoints).toBe(0)
      expect(summary.averageAccuracy).toBe(0)
      expect(summary.mostProblematicQuarter).toBeNull()
      expect(summary.overallQuality).toBe('No data')
    })

    it('should calculate summary for excellent quality data', () => {
      const preferences: TimingPreference[] = [
        {
          id: '1',
          accountId: 'user1',
          quarter: 'morning',
          preferredTime: '08:00',
          totalTaken: 15,
          averageDelay: 5
        },
        {
          id: '2',
          accountId: 'user1',
          quarter: 'evening',
          preferredTime: '20:00',
          totalTaken: 15,
          averageDelay: 10
        }
      ]
      const summary = getTimingSummary(preferences)
      expect(summary.totalDataPoints).toBe(30)
      expect(summary.averageAccuracy).toBe(8) // (5 + 10) / 2 rounded
      expect(summary.mostProblematicQuarter).toBe('Evening (6 PM - 12 AM)')
      expect(summary.overallQuality).toBe('Excellent')
    })

    it('should calculate summary for good quality data', () => {
      const preferences: TimingPreference[] = [
        {
          id: '1',
          accountId: 'user1',
          quarter: 'morning',
          preferredTime: '08:00',
          totalTaken: 8,
          averageDelay: 20
        },
        {
          id: '2',
          accountId: 'user1',
          quarter: 'afternoon',
          preferredTime: '14:00',
          totalTaken: 7,
          averageDelay: 25
        }
      ]
      const summary = getTimingSummary(preferences)
      expect(summary.totalDataPoints).toBe(15)
      expect(summary.averageAccuracy).toBe(23) // (20 + 25) / 2 rounded
      expect(summary.mostProblematicQuarter).toBe('Afternoon (12 PM - 6 PM)')
      expect(summary.overallQuality).toBe('Good')
    })

    it('should calculate summary for fair quality data', () => {
      const preferences: TimingPreference[] = [
        {
          id: '1',
          accountId: 'user1',
          quarter: 'night',
          preferredTime: '02:00',
          totalTaken: 5,
          averageDelay: 45
        }
      ]
      const summary = getTimingSummary(preferences)
      expect(summary.totalDataPoints).toBe(5)
      expect(summary.averageAccuracy).toBe(45)
      expect(summary.mostProblematicQuarter).toBe('Night (12 AM - 6 AM)')
      expect(summary.overallQuality).toBe('Fair')
    })

    it('should calculate summary for poor quality data', () => {
      const preferences: TimingPreference[] = [
        {
          id: '1',
          accountId: 'user1',
          quarter: 'morning',
          preferredTime: '08:00',
          totalTaken: 2,
          averageDelay: 60
        }
      ]
      const summary = getTimingSummary(preferences)
      expect(summary.totalDataPoints).toBe(2)
      expect(summary.overallQuality).toBe('Poor')
    })
  })
})
