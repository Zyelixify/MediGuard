import { describe, expect, it } from 'vitest'
import {
  getAdjustmentSuggestion,
  getDataQuality,
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
})
