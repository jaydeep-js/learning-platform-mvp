/* Admin data layer. Reads see ALL statuses (RLS grants admins that), writes
   are RLS-enforced server-side. Every catalog mutation invalidates the public
   catalog keys so the learner site updates immediately. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { keys } from './keys'
import { useToast } from '../components/ui/Toast'
import type { TopicLevel, TopicStatus } from '../lib/database.types'

export const adminKeys = {
  overview: ['admin', 'overview'] as const,
  topics: (q: string, status: string, page: number) => ['admin', 'topics', q, status, page] as const,
  topicsAll: ['admin', 'topics'] as const,
  editor: (slug: string) => ['admin', 'editor', slug] as const,
}

/* ---------------------------------------------------------------------------
   Shared admin snapshot: full category/subcategory tree + all topics (every
   status). 120 topic rows — aggregation happens client-side.
--------------------------------------------------------------------------- */

export interface AdminCategory {
  id: number
  slug: string
  name: string
  description: string
  sort_order: number
  updated_at: string
}

export interface AdminSubcategory {
  id: number
  category_id: number
  slug: string
  name: string
  description: string
  sort_order: number
}

export interface AdminTopicRow {
  id: number
  subcategory_id: number | null
  slug: string
  title: string
  status: TopicStatus
  updated_at: string
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview,
    staleTime: 30_000,
    queryFn: async () => {
      const [cats, subs, topics] = await Promise.all([
        supabase.from('categories').select('id, slug, name, description, sort_order, updated_at').order('sort_order'),
        supabase.from('subcategories').select('id, category_id, slug, name, description, sort_order').order('sort_order'),
        supabase.from('topics').select('id, subcategory_id, slug, title, status, updated_at').order('updated_at', { ascending: false }),
      ])
      for (const r of [cats, subs, topics]) {
        if (r.error) throw r.error
      }
      return {
        categories: cats.data! as AdminCategory[],
        subcategories: subs.data! as AdminSubcategory[],
        topics: topics.data! as AdminTopicRow[],
      }
    },
  })
}

function useInvalidateCatalog() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: keys.catalog })
    void queryClient.invalidateQueries({ queryKey: ['admin'] })
  }
}

/* ---------------------------------------------------------------------------
   Category / subcategory CRUD
--------------------------------------------------------------------------- */

export function useSaveCategory() {
  const invalidate = useInvalidateCatalog()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: { id?: number; name: string; description: string; sortOrder?: number }) => {
      if (input.id) {
        const { error } = await supabase.from('categories').update({ name: input.name, description: input.description }).eq('id', input.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert({ name: input.name, description: input.description, sort_order: input.sortOrder ?? 99 })
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast('Category saved')
      invalidate()
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't save the category"),
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCatalog()
  const toast = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast('Category deleted')
      invalidate()
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't delete the category"),
  })
}

export function useSaveSubcategory() {
  const invalidate = useInvalidateCatalog()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: { id?: number; name: string; categoryId: number; description: string; sortOrder?: number }) => {
      if (input.id) {
        const { error } = await supabase
          .from('subcategories')
          .update({ name: input.name, category_id: input.categoryId, description: input.description })
          .eq('id', input.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert({ name: input.name, category_id: input.categoryId, description: input.description, sort_order: input.sortOrder ?? 99 })
        if (error) throw error
      }
    },
    onSuccess: () => {
      toast('Subcategory saved')
      invalidate()
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't save the subcategory"),
  })
}

export function useDeleteSubcategory() {
  const invalidate = useInvalidateCatalog()
  const toast = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('subcategories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast('Subcategory deleted')
      invalidate()
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't delete the subcategory"),
  })
}

/* ---------------------------------------------------------------------------
   Topics table — server-side pagination, search, status filter.
--------------------------------------------------------------------------- */

export const TOPICS_PAGE_SIZE = 20

export interface AdminTopicListRow {
  id: number
  slug: string
  title: string
  status: TopicStatus
  updated_at: string
  subcategories: { name: string } | null
  topic_lessons: { count: number }[]
}

export function useAdminTopics(q: string, status: string, page: number) {
  return useQuery({
    queryKey: adminKeys.topics(q, status, page),
    staleTime: 15_000,
    queryFn: async () => {
      let query = supabase
        .from('topics')
        .select('id, slug, title, status, updated_at, subcategories(name), topic_lessons:lessons(count)', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range((page - 1) * TOPICS_PAGE_SIZE, page * TOPICS_PAGE_SIZE - 1)
      if (q) query = query.ilike('title', `%${q}%`)
      if (status !== 'all') query = query.eq('status', status as TopicStatus)
      const { data, error, count } = await query
      if (error) throw error
      return { rows: data as unknown as AdminTopicListRow[], total: count ?? 0 }
    },
  })
}

export function useDeleteTopic() {
  const invalidate = useInvalidateCatalog()
  const toast = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('topics').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast('Topic deleted')
      invalidate()
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't delete the topic"),
  })
}

/* ---------------------------------------------------------------------------
   Topic editor
--------------------------------------------------------------------------- */

export interface EditorLesson {
  id: number
  unit_id: number
  title: string
  body_md: string
  minutes: number
  sort_order: number
}

export interface EditorUnit {
  id: number
  title: string
  sort_order: number
}

export interface EditorTopic {
  id: number
  slug: string
  title: string
  description: string
  level: TopicLevel
  status: TopicStatus
  subcategory_id: number | null
  units: EditorUnit[]
  lessons: EditorLesson[]
}

export function useEditorTopic(slug: string | undefined) {
  return useQuery({
    queryKey: adminKeys.editor(slug ?? 'new'),
    enabled: slug !== undefined,
    staleTime: 15_000,
    queryFn: async (): Promise<EditorTopic | null> => {
      const { data: topic, error } = await supabase
        .from('topics')
        .select('id, slug, title, description, level, status, subcategory_id')
        .eq('slug', slug!)
        .maybeSingle()
      if (error) throw error
      if (!topic) return null
      const [units, lessons] = await Promise.all([
        supabase.from('units').select('id, title, sort_order').eq('topic_id', topic.id).order('sort_order'),
        supabase.from('lessons').select('id, unit_id, title, body_md, minutes, sort_order').eq('topic_id', topic.id).order('sort_order'),
      ])
      if (units.error) throw units.error
      if (lessons.error) throw lessons.error
      return { ...topic, units: units.data, lessons: lessons.data }
    },
  })
}

export interface TopicSaveInput {
  id?: number
  title: string
  description: string
  level: TopicLevel
  subcategoryId: number
  status: TopicStatus
}

export function useSaveTopic() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: async (input: TopicSaveInput): Promise<string> => {
      if (input.id) {
        const { data, error } = await supabase
          .from('topics')
          .update({
            title: input.title,
            description: input.description,
            level: input.level,
            subcategory_id: input.subcategoryId,
            status: input.status,
          })
          .eq('id', input.id)
          .select('slug')
          .single()
        if (error) throw error
        return data.slug
      }
      /* New topic appends to its subcategory's "Recommended" order. */
      const { count } = await supabase
        .from('topics')
        .select('id', { count: 'exact', head: true })
        .eq('subcategory_id', input.subcategoryId)
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: input.title,
          description: input.description,
          level: input.level,
          subcategory_id: input.subcategoryId,
          status: input.status,
          sort_order: (count ?? 0) + 1,
        })
        .select('slug')
        .single()
      if (error) throw error
      return data.slug
    },
    onSuccess: () => invalidate(),
  })
}

export function useSaveLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: number; title: string; bodyMd: string; minutes: number }) => {
      const { error } = await supabase
        .from('lessons')
        .update({ title: input.title, body_md: input.bodyMd, minutes: Math.max(1, input.minutes) })
        .eq('id', input.id)
      if (error) throw error
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'editor'] })
      void queryClient.invalidateQueries({ queryKey: ['lessons'] })
      void queryClient.invalidateQueries({ queryKey: ['lesson-body'] })
      void queryClient.invalidateQueries({ queryKey: keys.catalog })
    },
  })
}

export function useAddLesson() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: { topicId: number; units: EditorUnit[]; lessons: EditorLesson[] }) => {
      /* Append to the last unit; a brand-new topic gets "Unit 01" first. */
      let unitId = input.units[input.units.length - 1]?.id
      if (unitId === undefined) {
        const { data, error } = await supabase
          .from('units')
          .insert({ topic_id: input.topicId, title: 'Unit 01', sort_order: 1 })
          .select('id')
          .single()
        if (error) throw error
        unitId = data.id
      }
      const nextSort = (input.lessons[input.lessons.length - 1]?.sort_order ?? 0) + 1
      const { error } = await supabase
        .from('lessons')
        .insert({ topic_id: input.topicId, unit_id: unitId, title: `New lesson ${nextSort}`, body_md: '', minutes: 5, sort_order: nextSort })
      if (error) throw error
    },
    onSuccess: () => toast('Lesson added to the end of the list'),
    onError: (e) => toast(e instanceof Error ? e.message : "Couldn't add the lesson"),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'editor'] })
      void queryClient.invalidateQueries({ queryKey: ['lessons'] })
      void queryClient.invalidateQueries({ queryKey: keys.catalog })
    },
  })
}
