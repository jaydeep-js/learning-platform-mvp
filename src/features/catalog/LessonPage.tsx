import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import NotFoundPage from './NotFoundPage'
import LessonBody from './LessonBody'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { catHref, lessonHref, subHref, topicHref } from '../../lib/routes'
import { useCatalog, useLessonBody, useTopicLessons } from '../../data/catalog'
import { useBookmarks, useMarkComplete, useProgress, useRecordView, useToggleBookmark } from '../../data/learning'

export default function LessonPage() {
  const { topicSlug = '', n: nParam = '' } = useParams()
  const { user } = useAuth()
  const { catalog, isLoading, isError, refetch } = useCatalog()
  const lessons = useTopicLessons(topicSlug)
  const { progress } = useProgress()
  const { bookmarks } = useBookmarks()
  const toggleBookmark = useToggleBookmark()
  const markComplete = useMarkComplete()
  const recordView = useRecordView()
  const n = parseInt(nParam, 10)
  const body = useLessonBody(topicSlug, Number.isFinite(n) ? n : 0)
  const found = catalog?.findTopic(topicSlug)
  const flat = lessons.flat ?? []
  const cur = found && n >= 1 && n <= flat.length ? flat[n - 1] : null
  useDocTitle(found && cur ? `${cur.title} — ${found.topic.name} — Primer` : 'Primer')

  /* Feed "Recently viewed": latest lesson seen per topic. */
  const topicId = found?.topic.id
  const lessonId = cur?.id
  const userId = user?.id
  const record = recordView.mutate
  useEffect(() => {
    if (userId && topicId !== undefined && lessonId !== undefined) {
      record({ topicId, lessonId })
    }
  }, [userId, topicId, lessonId, record])

  if (isLoading || lessons.isLoading) return <PageLoading />
  if (isError || !catalog || lessons.isError) return <PageError onRetry={() => void refetch()} />
  if (!found || flat.length === 0) return <NotFoundPage />
  /* Out-of-range or non-numeric lesson number → first lesson. */
  if (!cur) return <Navigate to={lessonHref(topicSlug, 1)} replace />

  const { cat, sub, topic: t } = found
  const doneSet = progress.doneLessons
  const marked = t.id !== undefined && bookmarks.has(t.id)
  const isDone = cur.id !== undefined && doneSet.has(cur.id)
  const isLast = n >= flat.length

  return (
    <main>
      <div className="container page-head" style={{ paddingBottom: 0 }}>
        <Crumbs
          items={[
            { label: 'Home', href: '/' },
            { label: cat.name, href: catHref(cat.slug) },
            { label: sub.name, href: subHref(cat.slug, sub.slug) },
            { label: t.name, href: topicHref(t.slug) },
            { label: `Lesson ${n}` },
          ]}
        />
      </div>

      <div className="container section-tight">
        <div className="reader-layout">
          <aside className="reader-side">
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="reader-progress">
                <Link className="small w-600" to={topicHref(t.slug)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Icon name="arrow-left" className="icon-sm icon" />
                  Back to topic
                </Link>
                <div className="flex between center small" style={{ marginBottom: 8 }}>
                  <span className="mono muted">
                    Lesson {n} of {flat.length}
                  </span>
                  <span className="mono muted">{cur.mins} min</span>
                </div>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: `${Math.round((n / flat.length) * 100)}%` }}></span>
                </div>
              </div>
              <nav aria-label="Lessons in this topic" style={{ padding: 8 }}>
                {flat.map((l, i) => {
                  const idx = i + 1
                  const state = idx === n ? 'now' : user && l.id !== undefined && doneSet.has(l.id) ? 'done' : ''
                  return (
                    <Link
                      key={idx}
                      className={`lesson-row ${state}`}
                      to={lessonHref(t.slug, idx)}
                      aria-current={idx === n ? 'page' : undefined}
                    >
                      <span className="lr-state" aria-hidden="true">
                        {state === 'done' ? (
                          <Icon name="check" className="icon-sm icon" />
                        ) : state === 'now' ? (
                          <Icon name="play" className="icon-sm icon" />
                        ) : (
                          <span className="mono">{idx < 10 ? '0' : ''}{idx}</span>
                        )}
                      </span>
                      <span className="lr-title">{l.title}</span>
                      <span className="lr-time">{l.mins}m</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          <article>
            <div className="reader-topbar">
              <div>
                <p className="eyebrow">
                  {t.name} · {cur.unit}
                </p>
                <h1 style={{ fontSize: 30, marginTop: 8 }}>{cur.title}</h1>
              </div>
              <div className="flex center gap-2">
                {user ? (
                  <>
                    <button
                      className="btn btn-hi auth-user-only"
                      disabled={isDone || markComplete.isPending}
                      onClick={() =>
                        cur.id !== undefined &&
                        t.id !== undefined &&
                        markComplete.mutate({ lessonId: cur.id, topicId: t.id, minutes: cur.mins })
                      }
                    >
                      <Icon name="check" className="icon-sm icon" />
                      {isDone ? 'Completed' : 'Mark complete'}
                    </button>
                    <button
                      className={marked ? 'btn-icon auth-user-only is-active' : 'btn-icon auth-user-only'}
                      aria-pressed={marked}
                      aria-label="Bookmark this topic"
                      onClick={() => t.id !== undefined && toggleBookmark.mutate({ topicId: t.id, on: !marked })}
                    >
                      <Icon name={marked ? 'bookmark-fill' : 'bookmark'} className="icon-sm icon" />
                    </button>
                  </>
                ) : (
                  <Link className="btn btn-secondary btn-sm auth-guest-only" to="/auth">
                    <Icon name="log-in" className="icon-sm icon" />
                    Sign in to save progress
                  </Link>
                )}
              </div>
            </div>

            {/* Stored markdown, rendered into the .prose typography. */}
            {body.isPending ? (
              <div className="prose">
                <p className="small muted" role="status">
                  Loading lesson…
                </p>
              </div>
            ) : (
              <LessonBody markdown={body.data ?? ''} />
            )}

            <div className="reader-footnav">
              {n > 1 ? (
                <Link className="footnav-btn" to={lessonHref(t.slug, n - 1)}>
                  <span className="footnav-kind">← Previous</span>
                  <span className="footnav-title">{flat[n - 2].title}</span>
                </Link>
              ) : null}
              <Link className="footnav-btn next" to={isLast ? topicHref(t.slug) : lessonHref(t.slug, n + 1)}>
                <span className="footnav-kind">{isLast ? 'Finish' : 'Next'} →</span>
                <span className="footnav-title">{isLast ? `Back to ${t.name}` : flat[n].title}</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
