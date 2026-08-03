/* Route builders — the React equivalent of the prototype's
   catHref/subHref/topicHref/lesson URL helpers in app.js. */

export function catHref(catSlug: string): string {
  return `/categories/${catSlug}`
}

export function subHref(catSlug: string, subSlug: string): string {
  return `/categories/${catSlug}/${subSlug}`
}

export function topicHref(topicSlug: string): string {
  return `/topics/${topicSlug}`
}

export function lessonHref(topicSlug: string, n: number): string {
  return `/topics/${topicSlug}/lessons/${n}`
}

export function searchHref(q?: string): string {
  return q ? `/search?q=${encodeURIComponent(q)}` : '/search'
}
