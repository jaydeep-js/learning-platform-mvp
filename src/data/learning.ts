/* Member data layer: per-lesson progress, bookmarks, recent views, and the
   dashboard stats RPC. Topic percent is always DERIVED from progress rows —
   never stored (inverts the prototype's fake topic-percent model). */

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { keys } from './keys'
import { useAuth } from '../features/auth/AuthProvider'
import { useToast } from '../components/ui/Toast'
import type { Catalog } from './catalog'
import type { TopicContext } from './mock'

export interface ProgressRow {
  lesson_id: number
  topic_id: number
  completed_at: string
  minutes: number
}

export interface TopicProgress {
  done: number
  doneMinutes: number
  lastCompletedAt: string
}

export interface Progress {
  /* completed lesson ids */
  doneLessons: Set<number>
  /* per-topic aggregates keyed by topic id */
  byTopic: Map<number, TopicProgress>
  pctOf: (topicId: number | undefined, lessonCount: number) => number
}

const EMPTY_PROGRESS: Progress = {
  doneLessons: new Set(),
  byTopic: new Map(),
  pctOf: () => 0,
}

export function buildProgress(rows: ProgressRow[]): Progress {
  const doneLessons = new Set<number>()
  const byTopic = new Map<number, TopicProgress>()
  for (const r of rows) {
    doneLessons.add(r.lesson_id)
    const t = byTopic.get(r.topic_id) ?? { done: 0, doneMinutes: 0, lastCompletedAt: '' }
    t.done++
    t.doneMinutes += r.minutes
    if (r.completed_at > t.lastCompletedAt) t.lastCompletedAt = r.completed_at
    byTopic.set(r.topic_id, t)
  }
  return {
    doneLessons,
    byTopic,
    pctOf: (topicId, lessonCount) => {
      if (!topicId || !lessonCount) return 0
      const done = byTopic.get(topicId)?.done ?? 0
      if (done >= lessonCount) return 100
      return Math.min(99, Math.floor((done / lessonCount) * 100))
    },
  }
}

export function useProgress(): { progress: Progress; isLoading: boolean } {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: keys.progress(user?.id ?? 'anon'),
    enabled: user !== null,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('lesson_progress').select('lesson_id, topic_id, completed_at, minutes')
      if (error) throw error
      return data
    },
  })
  const progress = useMemo(() => (query.data ? buildProgress(query.data) : EMPTY_PROGRESS), [query.data])
  return { progress, isLoading: user !== null && query.isPending }
}

export function useMarkComplete() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (input: { lessonId: number; topicId: number; minutes: number }) => {
      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: user!.id,
          lesson_id: input.lessonId,
          topic_id: input.topicId,
          minutes: input.minutes,
        },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
      )
      if (error) throw error
    },
    /* Optimistic: the row appears in the cache immediately; rolled back on error. */
    onMutate: async (input) => {
      const key = keys.progress(user!.id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ProgressRow[]>(key)
      queryClient.setQueryData<ProgressRow[]>(key, (rows = []) =>
        rows.some((r) => r.lesson_id === input.lessonId)
          ? rows
          : [...rows, { lesson_id: input.lessonId, topic_id: input.topicId, minutes: input.minutes, completed_at: new Date().toISOString() }],
      )
      return { previous }
    },
    onError: (_err, _input, ctx) => {
      queryClient.setQueryData(keys.progress(user!.id), ctx?.previous)
      toast("Couldn't save your progress — try again")
    },
    onSuccess: () => toast('Lesson marked complete'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.progress(user!.id) })
      void queryClient.invalidateQueries({ queryKey: keys.dashboardStats(user!.id) })
    },
  })
}

export interface InProgressTopic {
  ctx: TopicContext
  pct: number
  remainingMins: number
  lastCompletedAt: string
}

/* Topics the member has started but not finished, most recent activity first
   — powers the home continue strip, the category resume strip, and the
   dashboard's Continue learning section. */
export function useInProgressTopics(catalog: Catalog | null): InProgressTopic[] {
  const { progress } = useProgress()
  return useMemo(() => {
    if (!catalog) return []
    const out: InProgressTopic[] = []
    for (const ctx of catalog.allTopics()) {
      const id = ctx.topic.id
      if (id === undefined) continue
      const tp = progress.byTopic.get(id)
      if (!tp || tp.done <= 0 || tp.done >= ctx.topic.lessons) continue
      out.push({
        ctx,
        pct: progress.pctOf(id, ctx.topic.lessons),
        remainingMins: Math.max(0, ctx.topic.mins - tp.doneMinutes),
        lastCompletedAt: tp.lastCompletedAt,
      })
    }
    return out.toSorted((a, b) => b.lastCompletedAt.localeCompare(a.lastCompletedAt))
  }, [catalog, progress])
}

/* ---------------------------------------------------------------------------
   Bookmarks — Set of topic ids, optimistic toggle.
--------------------------------------------------------------------------- */

export function useBookmarks(): { bookmarks: Set<number> } {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: keys.bookmarks(user?.id ?? 'anon'),
    enabled: user !== null,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('bookmarks').select('topic_id')
      if (error) throw error
      return data.map((b) => b.topic_id)
    },
  })
  const bookmarks = useMemo(() => new Set(query.data ?? []), [query.data])
  return { bookmarks }
}

export function useToggleBookmark() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (input: { topicId: number; on: boolean }) => {
      if (input.on) {
        const { error } = await supabase.from('bookmarks').upsert(
          { user_id: user!.id, topic_id: input.topicId },
          { onConflict: 'user_id,topic_id', ignoreDuplicates: true },
        )
        if (error) throw error
      } else {
        const { error } = await supabase.from('bookmarks').delete().eq('user_id', user!.id).eq('topic_id', input.topicId)
        if (error) throw error
      }
    },
    onMutate: async (input) => {
      const key = keys.bookmarks(user!.id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<number[]>(key)
      queryClient.setQueryData<number[]>(key, (ids = []) =>
        input.on ? [...new Set([...ids, input.topicId])] : ids.filter((id) => id !== input.topicId),
      )
      toast(input.on ? 'Saved to your bookmarks' : 'Removed from bookmarks')
      return { previous }
    },
    onError: (_err, _input, ctx) => {
      queryClient.setQueryData(keys.bookmarks(user!.id), ctx?.previous)
      toast("Couldn't update your bookmarks — try again")
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.bookmarks(user!.id) })
      void queryClient.invalidateQueries({ queryKey: keys.dashboardStats(user!.id) })
    },
  })
}

/* ---------------------------------------------------------------------------
   Recent views — upserted on lesson visits, latest row per topic.
--------------------------------------------------------------------------- */

export interface RecentViewEntry {
  viewed_at: string
  lesson_sort: number | null
  topic_slug: string
  topic_title: string
}

export function useRecentViews() {
  const { user } = useAuth()
  return useQuery({
    queryKey: keys.recentViews(user?.id ?? 'anon'),
    enabled: user !== null,
    staleTime: 30_000,
    queryFn: async (): Promise<RecentViewEntry[]> => {
      const { data, error } = await supabase
        .from('recent_views')
        .select('viewed_at, topics!inner(slug, title), lessons(sort_order)')
        .order('viewed_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data as unknown as { viewed_at: string; topics: { slug: string; title: string }; lessons: { sort_order: number } | null }[]).map(
        (r) => ({
          viewed_at: r.viewed_at,
          lesson_sort: r.lessons?.sort_order ?? null,
          topic_slug: r.topics.slug,
          topic_title: r.topics.title,
        }),
      )
    },
  })
}

export function useRecordView() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { topicId: number; lessonId?: number }) => {
      const { error } = await supabase.from('recent_views').upsert(
        {
          user_id: user!.id,
          topic_id: input.topicId,
          lesson_id: input.lessonId ?? null,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' },
      )
      if (error) throw error
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.recentViews(user!.id) })
    },
  })
}

/* ---------------------------------------------------------------------------
   Dashboard stat cards — one RPC. tz offset makes streak days local.
--------------------------------------------------------------------------- */

export function useDashboardStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: keys.dashboardStats(user?.id ?? 'anon'),
    enabled: user !== null,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_stats', {
        tz_offset_minutes: -new Date().getTimezoneOffset(),
      })
      if (error) throw error
      return data[0] ?? { day_streak: 0, lessons_done: 0, minutes_this_month: 0, bookmark_count: 0 }
    },
  })
}
