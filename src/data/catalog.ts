/* Catalog data layer. One cached query loads the whole published catalog
   (8 categories / 31 subcategories / 120 topics + stats — a few KB) in four
   parallel requests, assembled into the exact shape the pages consumed from
   the M0 mock, so page code stays unchanged. Lessons load per topic. */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { keys } from './keys'
import type { Category, Level, Subcategory, Topic, TopicContext, Unit, FlatLesson } from './mock'

export interface Catalog {
  categories: Category[]
  getCategory: (slug: string) => Category | null
  findSub: (subSlug: string) => { cat: Category; sub: Subcategory } | null
  findTopic: (topicSlug: string) => TopicContext | null
  topicsFor: (subSlug: string) => Topic[]
  topicCounts: (catSlug: string) => { topics: number; mins: number }
  allTopics: () => TopicContext[]
}

async function fetchCatalog() {
  const [cats, subs, topics, stats] = await Promise.all([
    supabase.from('categories').select('id, slug, name, description, icon, tint, tint_ink, sort_order').order('sort_order'),
    supabase.from('subcategories').select('id, category_id, slug, name, description, sort_order').order('sort_order'),
    supabase
      .from('topics')
      .select('id, subcategory_id, slug, title, description, level, sort_order')
      .eq('status', 'published')
      .not('subcategory_id', 'is', null)
      .order('sort_order'),
    supabase.from('topic_stats').select('topic_id, lesson_count, total_minutes'),
  ])
  for (const r of [cats, subs, topics, stats]) {
    if (r.error) throw r.error
  }
  return { cats: cats.data!, subs: subs.data!, topics: topics.data!, stats: stats.data! }
}

function buildCatalog(data: Awaited<ReturnType<typeof fetchCatalog>>): Catalog {
  const statById = new Map(data.stats.map((s) => [s.topic_id, s]))

  const topicsBySub = new Map<number, Topic[]>()
  for (const t of data.topics) {
    const stat = statById.get(t.id)
    const topic: Topic = {
      slug: t.slug,
      name: t.title,
      level: t.level as Level,
      mins: stat?.total_minutes ?? 0,
      lessons: stat?.lesson_count ?? 0,
      desc: t.description,
      id: t.id,
    }
    const list = topicsBySub.get(t.subcategory_id!) ?? []
    list.push(topic)
    topicsBySub.set(t.subcategory_id!, list)
  }

  const subSlugToTopics = new Map<string, Topic[]>()
  const categories: Category[] = data.cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    tint: c.tint,
    tintInk: c.tint_ink,
    desc: c.description,
    subs: data.subs
      .filter((s) => s.category_id === c.id)
      .map((s) => {
        subSlugToTopics.set(s.slug, topicsBySub.get(s.id) ?? [])
        return { slug: s.slug, name: s.name, desc: s.description }
      }),
  }))

  const topicsFor = (subSlug: string) => subSlugToTopics.get(subSlug) ?? []

  const topicIndex = new Map<string, TopicContext>()
  for (const cat of categories) {
    for (const sub of cat.subs) {
      for (const topic of topicsFor(sub.slug)) {
        topicIndex.set(topic.slug, { cat, sub, topic })
      }
    }
  }

  return {
    categories,
    getCategory: (slug) => categories.find((c) => c.slug === slug) ?? null,
    findSub: (subSlug) => {
      for (const cat of categories) {
        const sub = cat.subs.find((s) => s.slug === subSlug)
        if (sub) return { cat, sub }
      }
      return null
    },
    findTopic: (topicSlug) => topicIndex.get(topicSlug) ?? null,
    topicsFor,
    topicCounts: (catSlug) => {
      const cat = categories.find((c) => c.slug === catSlug)
      if (!cat) return { topics: 0, mins: 0 }
      let topics = 0
      let mins = 0
      for (const sub of cat.subs) {
        for (const t of topicsFor(sub.slug)) {
          topics++
          mins += t.mins
        }
      }
      return { topics, mins }
    },
    allTopics: () => [...topicIndex.values()],
  }
}

export function useCatalog() {
  const query = useQuery({ queryKey: keys.catalog, queryFn: fetchCatalog, staleTime: 5 * 60_000 })
  const catalog = useMemo(() => (query.data ? buildCatalog(query.data) : null), [query.data])
  return { catalog, isLoading: query.isPending, isError: query.isError, refetch: query.refetch }
}

/* ---------------------------------------------------------------------------
   Lessons of one topic (titles/minutes only — bodies load per lesson).
   Filtered through the embedded topics relation so it needs no topic id and
   runs in parallel with the catalog query.
--------------------------------------------------------------------------- */

interface LessonListRow {
  id: number
  title: string
  minutes: number
  sort_order: number
  units: { title: string; sort_order: number }
}

export function useTopicLessons(topicSlug: string) {
  const query = useQuery({
    queryKey: keys.lessons(topicSlug),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, minutes, sort_order, units!inner(title, sort_order), topics!inner(slug)')
        .eq('topics.slug', topicSlug)
        .order('sort_order')
      if (error) throw error
      return data as unknown as LessonListRow[]
    },
  })

  return useMemo(() => {
    const rows = query.data
    if (!rows) return { units: null as Unit[] | null, flat: null as FlatLesson[] | null, isLoading: query.isPending, isError: query.isError }

    const units: Unit[] = []
    const flat: FlatLesson[] = []
    for (const row of rows) {
      let unit = units[units.length - 1]
      if (!unit || unit.unit !== row.units.title) {
        unit = { unit: row.units.title, items: [] }
        units.push(unit)
      }
      unit.items.push({ title: row.title, mins: row.minutes, id: row.id })
      flat.push({ title: row.title, mins: row.minutes, unit: row.units.title, unitIndex: units.length - 1, id: row.id })
    }
    return { units, flat, isLoading: query.isPending, isError: query.isError }
  }, [query.data, query.isPending, query.isError])
}

export function useLessonBody(topicSlug: string, n: number) {
  return useQuery({
    queryKey: keys.lessonBody(topicSlug, n),
    staleTime: 5 * 60_000,
    enabled: n >= 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('body_md, topics!inner(slug)')
        .eq('topics.slug', topicSlug)
        .eq('sort_order', n)
        .maybeSingle()
      if (error) throw error
      return data?.body_md ?? null
    },
  })
}

/* ---------------------------------------------------------------------------
   Search — FTS via the search_topics RPC; results are re-resolved through the
   cached catalog for rendering, so the RPC only decides matching + order.
--------------------------------------------------------------------------- */

export function useSearch(q: string) {
  return useQuery({
    queryKey: keys.search(q),
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_topics', { q })
      if (error) throw error
      return data.map((r) => r.slug)
    },
  })
}
