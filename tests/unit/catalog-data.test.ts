/* Determinism guard for the catalog generators — scripts/generate-seed.ts
   ports these bit-for-bit from the prototype's data.js, so the seeded
   database must always reproduce these exact fixtures. */
import { describe, expect, it } from 'vitest'
import { CATEGORIES, allTopics, findTopic, flatLessons, lessonsFor, topicsFor } from '../../src/data/mock'

describe('catalog shape', () => {
  it('has 8 categories, 31 subcategories, 120 topics', () => {
    expect(CATEGORIES).toHaveLength(8)
    expect(CATEGORIES.reduce((a, c) => a + c.subs.length, 0)).toBe(31)
    expect(allTopics()).toHaveLength(120)
  })

  it('keeps the hand-authored hero path intact', () => {
    const ctx = findTopic('javascript-basics')
    expect(ctx).not.toBeNull()
    expect(ctx!.cat.slug).toBe('programming')
    expect(ctx!.sub.slug).toBe('javascript')
    expect(ctx!.topic.mins).toBe(200)
    const flat = flatLessons(ctx!.topic)
    expect(flat).toHaveLength(13)
    expect(flat[0].title).toBe('What is JavaScript?')
    expect(flat[12].title).toBe('Debugging in DevTools')
    expect(lessonsFor(ctx!.topic)).toHaveLength(4) // units
  })
})

describe('deterministic generators', () => {
  it('generates exactly 4 topics per non-authored subcategory with stable slugs', () => {
    const topics = topicsFor('ui-design')
    expect(topics.map((t) => t.slug)).toEqual(['ui-design-foundations', 'ui-design-practical', 'ui-design-in-depth', 'ui-design-studio'])
    expect(topics[0].name).toBe('UI Design Foundations')
    expect(topics[0].level).toBe('beginner')
  })

  it('produces identical values on every call (hash determinism)', () => {
    const a = topicsFor('investing')
    const b = topicsFor('investing')
    expect(a).toEqual(b)
    expect(flatLessons(a[0])).toEqual(flatLessons(b[0]))
  })

  it('keeps generated values inside the seed contract', () => {
    for (const { topic } of allTopics()) {
      expect(topic.mins).toBeGreaterThanOrEqual(90)
      expect(topic.lessons).toBeGreaterThanOrEqual(8)
      for (const l of flatLessons(topic)) {
        expect(l.mins).toBeGreaterThan(0)
      }
    }
  })
})
