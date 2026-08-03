/* Query-key factory — every hook builds its keys here so invalidation
   (M3 mutations, M4 admin writes) has one vocabulary. */
export const keys = {
  catalog: ['catalog'] as const,
  lessons: (topicSlug: string) => ['lessons', topicSlug] as const,
  lessonBody: (topicSlug: string, n: number) => ['lesson-body', topicSlug, n] as const,
  search: (q: string) => ['search', q] as const,
  progress: (uid: string) => ['progress', uid] as const,
  bookmarks: (uid: string) => ['bookmarks', uid] as const,
  recentViews: (uid: string) => ['recent-views', uid] as const,
  dashboardStats: (uid: string) => ['dashboard-stats', uid] as const,
  profile: (uid: string) => ['profile', uid] as const,
}
