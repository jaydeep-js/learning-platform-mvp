import { describe, expect, it } from 'vitest'
import { fmtMins, fmtRelative } from '../../src/lib/format'

describe('fmtMins', () => {
  /* Output must stay identical to the prototype's data.js fmtMins. */
  it('formats minutes-only durations', () => {
    expect(fmtMins(45)).toBe('45m')
    expect(fmtMins(0)).toBe('0m')
  })
  it('formats hours with zero-padded minutes under 10', () => {
    expect(fmtMins(200)).toBe('3h 20m')
    expect(fmtMins(65)).toBe('1h 05m')
  })
  it('drops the minute part on exact hours', () => {
    expect(fmtMins(300)).toBe('5h')
  })
})

describe('fmtRelative', () => {
  const at = (daysAgo: number) => {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString()
  }
  it('uses Today with a time for same-day timestamps', () => {
    expect(fmtRelative(new Date().toISOString())).toMatch(/^Today, \d{1,2}:\d{2}/)
  })
  it('uses Yesterday and N days ago', () => {
    expect(fmtRelative(at(1))).toBe('Yesterday')
    expect(fmtRelative(at(3))).toBe('3 days ago')
  })
  it('falls back to a date for older timestamps', () => {
    expect(fmtRelative('2026-01-05T10:00:00Z')).toBe('Jan 5, 2026')
  })
})
