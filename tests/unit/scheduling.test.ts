import { describe, expect, it } from 'vitest'
import { calculateScheduledDates } from '~/utils/scheduling'

describe('calculateScheduledDates', () => {
  const startDate = new Date('2026-01-01T00:00:00')
  const endDate = new Date('2026-01-07T23:59:59') // 1 week

  it('should schedule daily medications correctly', () => {
    const dates = calculateScheduledDates(startDate, endDate, 'Once a day', ['09:00'])
    expect(dates).toHaveLength(7)
    expect(dates[0].getHours()).toBe(9)
    expect(dates[0].getMinutes()).toBe(0)
    expect(dates[6].getHours()).toBe(9)
  })

  it('should schedule multiple daily times correctly', () => {
    const dates = calculateScheduledDates(startDate, endDate, 'Twice a day', ['09:00', '21:00'])
    expect(dates).toHaveLength(14)
    expect(dates[0].getHours()).toBe(9)
    expect(dates[1].getHours()).toBe(21)
  })

  it('should schedule weekly medications correctly (Once a week)', () => {
    const longEndDate = new Date('2026-01-31T23:59:59')
    const dates = calculateScheduledDates(startDate, longEndDate, 'Once a week', ['09:00'])
    // 1st, 8th, 15th, 22nd, 29th -> 5 dates
    expect(dates.length).toBeGreaterThanOrEqual(4)
    expect(dates[0].getDate()).toBe(1)
    expect(dates[1].getDate()).toBe(8)
  })

  it('should schedule weekly medications correctly (Twice a week -> every 3 days)', () => {
    const dates = calculateScheduledDates(startDate, endDate, 'Twice a week', ['09:00'])
    // "Twice a week" uses 3-day intervals, resulting in 2-3 occurrences per 7-day period
    // depending on the date range. In this 7-day test period (Jan 1-7), we get 3 dates:
    // 1st (start), 4th (+3 days), 7th (+3 days)
    expect(dates).toHaveLength(3)
    expect(dates[0].getDate()).toBe(1)
    expect(dates[1].getDate()).toBe(4)
    expect(dates[2].getDate()).toBe(7)
  })

  it('should schedule monthly medications correctly', () => {
    const yearEnd = new Date('2026-12-31T23:59:59')
    const dates = calculateScheduledDates(startDate, yearEnd, 'Once a month', ['09:00'])
    expect(dates).toHaveLength(12)
    expect(dates[0].getMonth()).toBe(0)
    expect(dates[11].getMonth()).toBe(11)
  })

  it('should throw error if dailyTimes is empty for daily medications', () => {
    expect(() => {
      calculateScheduledDates(startDate, endDate, 'Once a day', [])
    }).toThrow('dailyTimes array cannot be empty for daily medications')
  })

  it('should throw error if dailyTimes is null for daily medications', () => {
    expect(() => {
      calculateScheduledDates(startDate, endDate, 'Twice a day', null as any)
    }).toThrow('dailyTimes array cannot be empty for daily medications')
  })
})
