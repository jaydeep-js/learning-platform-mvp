import { describe, expect, it } from 'vitest'
import { buildProgress, type ProgressRow } from '../../src/data/learning'

const row = (lesson: number, topic: number, minutes = 10, at = '2026-08-01T10:00:00Z'): ProgressRow => ({
  lesson_id: lesson,
  topic_id: topic,
  minutes,
  completed_at: at,
})

describe('buildProgress', () => {
  it('aggregates per topic and tracks completed lesson ids', () => {
    const p = buildProgress([row(1, 100, 6), row(2, 100, 8, '2026-08-02T10:00:00Z'), row(50, 200, 12)])
    expect(p.doneLessons.has(1)).toBe(true)
    expect(p.doneLessons.has(3)).toBe(false)
    expect(p.byTopic.get(100)).toEqual({ done: 2, doneMinutes: 14, lastCompletedAt: '2026-08-02T10:00:00Z' })
    expect(p.byTopic.get(200)?.done).toBe(1)
  })

  it('derives percent: 100 only when every lesson is done, capped at 99 otherwise', () => {
    const p = buildProgress([row(1, 100), row(2, 100)])
    expect(p.pctOf(100, 13)).toBe(Math.floor((2 / 13) * 100))
    expect(p.pctOf(100, 2)).toBe(100)
    /* 199 of 200 done must not round up to a false "Completed". */
    const many = buildProgress(Array.from({ length: 199 }, (_, i) => row(i + 1, 300)))
    expect(many.pctOf(300, 200)).toBe(99)
  })

  it('handles empty and unknown topics', () => {
    const p = buildProgress([])
    expect(p.pctOf(1, 10)).toBe(0)
    expect(p.pctOf(undefined, 10)).toBe(0)
    expect(p.pctOf(1, 0)).toBe(0)
  })
})
