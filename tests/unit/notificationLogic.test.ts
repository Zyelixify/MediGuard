import { describe, expect, it } from 'vitest'
import {
  calculateOverdueTime,
  formatNotificationBody,
  generateTTSMessage,
  shouldTriggerNotification
} from '~/utils/notificationLogic'

describe('notificationLogic', () => {
  describe('generateTTSMessage', () => {
    it('should generate correct dose message', () => {
      const msg = generateTTSMessage('dose', 'Aspirin', '500mg')
      expect(msg).toBe('Medication reminder: It\'s time to take your Aspirin 500mg.')
    })

    it('should generate correct overdue message', () => {
      const msg = generateTTSMessage('overdue', 'Aspirin', '500mg', '2 hours')
      expect(msg).toBe('Overdue medication alert: Your Aspirin 500mg is overdue by 2 hours.')
    })
  })

  describe('calculateOverdueTime', () => {
    it('should return empty string if not overdue', () => {
      const now = new Date('2026-01-30T10:00:00')
      const scheduled = new Date('2026-01-30T10:30:00')
      expect(calculateOverdueTime(scheduled, now)).toBe('')
    })

    it('should return minutes if overdue by < 60 mins', () => {
      const now = new Date('2026-01-30T10:30:00')
      const scheduled = new Date('2026-01-30T10:00:00') // 30 mins ago
      expect(calculateOverdueTime(scheduled, now)).toBe('30 minutes')
    })

    it('should return hours if overdue by >= 60 mins', () => {
      const now = new Date('2026-01-30T12:00:00')
      const scheduled = new Date('2026-01-30T10:00:00') // 2 hours ago
      expect(calculateOverdueTime(scheduled, now)).toBe('2 hours')
    })
  })

  describe('shouldTriggerNotification', () => {
    it('should return true if time matches exactly', () => {
      const now = new Date('2026-01-30T10:00:00')
      const scheduled = new Date('2026-01-30T10:00:00')
      expect(shouldTriggerNotification(scheduled, now)).toBe(true)
    })

    it('should return true if within tolerance before scheduled time', () => {
      const scheduled = new Date('2026-01-30T10:00:00')
      const nowBefore = new Date('2026-01-30T09:59:30') // 30s before, within tolerance window
      expect(shouldTriggerNotification(scheduled, nowBefore)).toBe(true)
    })

    it('should return false if too early', () => {
      const scheduled = new Date('2026-01-30T10:00:00')
      const nowTooEarly = new Date('2026-01-30T09:00:00') // 1 hour before
      expect(shouldTriggerNotification(scheduled, nowTooEarly)).toBe(false)
    })
  })

  describe('formatNotificationBody', () => {
    it('should format dose body', () => {
      expect(formatNotificationBody('dose', 'Meds', '10mg', '10:00 AM'))
        .toContain('Time to take Meds (10mg) - scheduled for 10:00 AM')
    })
  })
})
