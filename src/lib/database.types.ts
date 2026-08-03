/* Database types for supabase-js.
   Hand-authored to match supabase/migrations exactly; once the hosted project
   is linked, regenerate with:
     npx supabase gen types typescript --linked > src/lib/database.types.ts */

export type TopicLevel = 'beginner' | 'intermediate' | 'advanced'
export type TopicStatus = 'draft' | 'review' | 'published'

type CategoryRow = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  tint: string
  tint_ink: string
  sort_order: number
  created_at: string
  updated_at: string
}

type SubcategoryRow = {
  id: number
  category_id: number
  slug: string
  name: string
  description: string
  sort_order: number
  created_at: string
  updated_at: string
}

type TopicRow = {
  id: number
  subcategory_id: number | null
  slug: string
  title: string
  description: string
  level: TopicLevel
  status: TopicStatus
  sort_order: number
  created_at: string
  updated_at: string
}

type UnitRow = {
  id: number
  topic_id: number
  title: string
  sort_order: number
  created_at: string
  updated_at: string
}

type LessonRow = {
  id: number
  topic_id: number
  unit_id: number
  title: string
  body_md: string
  minutes: number
  sort_order: number
  created_at: string
  updated_at: string
}

type ProfileRow = {
  id: string
  full_name: string
  role: 'learner' | 'admin'
  pref_weekly_recap: boolean
  pref_streak_reminder: boolean
  created_at: string
  updated_at: string
}

type LessonProgressRow = {
  user_id: string
  lesson_id: number
  topic_id: number
  completed_at: string
  minutes: number
}

type BookmarkRow = {
  user_id: string
  topic_id: number
  created_at: string
}

type RecentViewRow = {
  user_id: string
  topic_id: number
  lesson_id: number | null
  viewed_at: string
}

type Insertable<Row, Generated extends keyof Row, Optional extends keyof Row> = Omit<Row, Generated | Optional> &
  Partial<Pick<Row, Optional>>

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow
        Insert: Insertable<CategoryRow, 'id', 'slug' | 'description' | 'icon' | 'tint' | 'tint_ink' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CategoryRow, 'id'>>
        Relationships: []
      }
      subcategories: {
        Row: SubcategoryRow
        Insert: Insertable<SubcategoryRow, 'id', 'slug' | 'description' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SubcategoryRow, 'id'>>
        Relationships: []
      }
      topics: {
        Row: TopicRow
        Insert: Insertable<TopicRow, 'id', 'slug' | 'description' | 'level' | 'status' | 'sort_order' | 'subcategory_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TopicRow, 'id'>>
        Relationships: []
      }
      units: {
        Row: UnitRow
        Insert: Insertable<UnitRow, 'id', 'created_at' | 'updated_at'>
        Update: Partial<Omit<UnitRow, 'id'>>
        Relationships: []
      }
      lessons: {
        Row: LessonRow
        Insert: Insertable<LessonRow, 'id', 'body_md' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LessonRow, 'id'>>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: Insertable<ProfileRow, never, 'full_name' | 'role' | 'pref_weekly_recap' | 'pref_streak_reminder' | 'created_at' | 'updated_at'>
        Update: Partial<Pick<ProfileRow, 'full_name' | 'pref_weekly_recap' | 'pref_streak_reminder'>>
        Relationships: []
      }
      lesson_progress: {
        Row: LessonProgressRow
        Insert: Insertable<LessonProgressRow, never, 'completed_at'>
        Update: Partial<LessonProgressRow>
        Relationships: []
      }
      bookmarks: {
        Row: BookmarkRow
        Insert: Insertable<BookmarkRow, never, 'created_at'>
        Update: Partial<BookmarkRow>
        Relationships: []
      }
      recent_views: {
        Row: RecentViewRow
        Insert: Insertable<RecentViewRow, never, 'lesson_id' | 'viewed_at'>
        Update: Partial<RecentViewRow>
        Relationships: []
      }
    }
    Views: {
      topic_stats: {
        Row: { topic_id: number; lesson_count: number; total_minutes: number }
        Relationships: []
      }
      category_stats: {
        Row: { category_id: number; subcategory_count: number; topic_count: number; total_minutes: number }
        Relationships: []
      }
    }
    Functions: {
      search_topics: {
        Args: { q: string }
        Returns: {
          slug: string
          title: string
          description: string
          level: TopicLevel
          topic_sort_order: number
          sub_slug: string
          sub_name: string
          cat_slug: string
          cat_name: string
          lesson_count: number
          total_minutes: number
        }[]
      }
      dashboard_stats: {
        Args: { tz_offset_minutes?: number }
        Returns: {
          day_streak: number
          lessons_done: number
          minutes_this_month: number
          bookmark_count: number
        }[]
      }
    }
    Enums: {
      topic_level: TopicLevel
      topic_status: TopicStatus
    }
    CompositeTypes: Record<string, never>
  }
}
