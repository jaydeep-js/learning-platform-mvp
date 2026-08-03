import { Link, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import LevelBadge from '../../components/ui/LevelBadge'
import TopicCard from './TopicCard'
import NotFoundPage from './NotFoundPage'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { fmtMins } from '../../lib/format'
import { catHref, lessonHref, subHref } from '../../lib/routes'
import { useCatalog, useTopicLessons } from '../../data/catalog'
import { useBookmarks, useProgress, useToggleBookmark } from '../../data/learning'

export default function TopicPage() {
  const { topicSlug = '' } = useParams()
  const { user } = useAuth()
  const { catalog, isLoading, isError, refetch } = useCatalog()
  const lessons = useTopicLessons(topicSlug)
  const { progress } = useProgress()
  const { bookmarks } = useBookmarks()
  const toggleBookmark = useToggleBookmark()
  const found = catalog?.findTopic(topicSlug)
  useDocTitle(found ? `${found.topic.name} — Primer` : 'Primer')
  if (isLoading || lessons.isLoading) return <PageLoading />
  if (isError || !catalog || lessons.isError) return <PageError onRetry={() => void refetch()} />
  if (!found || !lessons.units || !lessons.flat) return <NotFoundPage />

  const { cat, sub, topic: t } = found
  const flat = lessons.flat
  const units = lessons.units
  const doneSet = progress.doneLessons
  const doneCount = flat.filter((l) => l.id !== undefined && doneSet.has(l.id)).length
  const pct = doneCount >= flat.length && flat.length > 0 ? 100 : Math.min(99, Math.floor((doneCount / Math.max(1, flat.length)) * 100))
  /* Current lesson = first uncompleted, in order. */
  const nextIdx = flat.findIndex((l) => l.id === undefined || !doneSet.has(l.id))
  const nextN = nextIdx === -1 ? flat.length : nextIdx + 1
  const related = catalog.topicsFor(sub.slug).filter((x) => x.slug !== t.slug).slice(0, 3)
  const marked = t.id !== undefined && bookmarks.has(t.id)

  let n = 0
  return (
    <main>
      <div className="container page-head">
        <Crumbs
          items={[
            { label: 'Home', href: '/' },
            { label: cat.name, href: catHref(cat.slug) },
            { label: sub.name, href: subHref(cat.slug, sub.slug) },
            { label: t.name },
          ]}
        />
        <div className="ph-row">
          <div>
            <div className="flex center gap-2 wrap" style={{ marginTop: 10 }}>
              <LevelBadge level={t.level} />
              <span className="tag">
                <Icon name="clock" className="icon-sm icon" />
                <span className="mono">{fmtMins(t.mins)}</span>
              </span>
              <span className="tag mono">{t.lessons} lessons</span>
            </div>
            <h1 style={{ marginTop: 12 }}>{t.name}</h1>
            <p className="ph-desc">{t.desc}</p>
          </div>
        </div>
      </div>

      <div className="container section-tight">
        <div className="topic-layout">
          <div>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <div className="sh-text">
                <p className="eyebrow">Work through these in order</p>
                <h2>Lessons</h2>
              </div>
            </div>
            <div>
              {units.map((u, ui) => (
                <section key={ui} className="unit">
                  <div className="unit-head">
                    <span className="unit-num">UNIT {ui < 9 ? '0' : ''}{ui + 1}</span>
                    <span className="unit-title">{u.unit}</span>
                    <span className="unit-count tag mono">{u.items.length} lessons</span>
                  </div>
                  {u.items.map((l) => {
                    n++
                    const idx = n
                    const isDone = l.id !== undefined && doneSet.has(l.id)
                    const state = user ? (isDone ? 'done' : idx === nextN ? 'now' : '') : ''
                    return (
                      <Link key={idx} className={`lesson-row ${state}`} to={lessonHref(t.slug, idx)}>
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
                        {state === 'done' ? <span className="visually-hidden">(completed)</span> : null}
                        <span className="lr-time">{l.mins}m</span>
                      </Link>
                    )
                  })}
                </section>
              ))}
            </div>

            <div style={{ marginTop: 44 }}>
              <div className="section-head">
                <div className="sh-text">
                  <p className="eyebrow">In the same subcategory</p>
                  <h2>Related topics</h2>
                </div>
              </div>
              <div className="grid grid-3">
                {related.map((x) => (
                  <TopicCard key={x.slug} ctx={{ cat, sub, topic: x }} />
                ))}
              </div>
            </div>
          </div>

          <aside className="topic-side">
            <div className="card card-pad">
              {user ? (
                <div className="auth-user-only" style={{ textAlign: 'center' }}>
                  <div className="ring" style={{ margin: '0 auto', background: `conic-gradient(var(--hi) ${pct * 3.6}deg, var(--paper-2) 0)` }}>
                    <div className="ring-in">
                      <b>{pct}%</b>
                      <span>complete</span>
                    </div>
                  </div>
                  <p className="small muted" style={{ marginTop: 12 }}>
                    {doneCount} of {flat.length} lessons finished
                  </p>
                  <div className="flex col gap-2" style={{ marginTop: 18 }}>
                    <Link className="btn btn-primary btn-block" to={lessonHref(t.slug, nextN)}>
                      {pct > 0 ? 'Continue learning' : 'Start this topic'}
                    </Link>
                    <button
                      className={marked ? 'btn btn-secondary btn-block is-active' : 'btn btn-secondary btn-block'}
                      onClick={() => t.id !== undefined && toggleBookmark.mutate({ topicId: t.id, on: !marked })}
                      aria-pressed={marked}
                    >
                      <Icon name={marked ? 'bookmark-fill' : 'bookmark'} className="icon-sm icon" />
                      Save for later
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-guest-only" style={{ textAlign: 'center' }}>
                  <p className="small" style={{ color: 'var(--body)' }}>
                    You can read every lesson as a guest. Sign in to save your progress as you go.
                  </p>
                  <div className="flex col gap-2" style={{ marginTop: 18 }}>
                    <Link className="btn btn-primary btn-block" to={lessonHref(t.slug, 1)}>
                      Start first lesson
                    </Link>
                    <Link className="btn btn-secondary btn-block" to="/auth">
                      Log in to track progress
                    </Link>
                  </div>
                </div>
              )}

              <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 10px' }}></div>
              <div>
                <div className="flex between small" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <span>Estimated time</span>
                  <b className="mono ink">{fmtMins(t.mins)}</b>
                </div>
                <div className="flex between small center" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
                  <span>Difficulty</span>
                  <LevelBadge level={t.level} />
                </div>
                <div className="flex between small" style={{ padding: '9px 0' }}>
                  <span>Lessons</span>
                  <b className="mono ink">{flat.length}</b>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
