import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { fmtMins, fmtRelative } from '../../lib/format'
import { lessonHref, topicHref } from '../../lib/routes'
import { useCatalog } from '../../data/catalog'
import { useBookmarks, useDashboardStats, useInProgressTopics, useRecentViews } from '../../data/learning'

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  useDocTitle('Dashboard — Primer')
  const { user } = useAuth()
  const { catalog } = useCatalog()
  const inProgress = useInProgressTopics(catalog)
  const { bookmarks } = useBookmarks()
  const stats = useDashboardStats()
  const recent = useRecentViews()

  if (!user) {
    return (
      <main>
        <div className="container section auth-guest-only">
          <div className="card" style={{ maxWidth: 560, margin: '24px auto' }}>
            <div className="empty">
              <div className="empty-icon">
                <Icon name="lock" />
              </div>
              <h3>Your dashboard lives behind a free account</h3>
              <p className="small" style={{ maxWidth: 400 }}>
                Progress, streaks, and bookmarks are saved to your account. Log in to see where you left off, or keep browsing as a guest.
              </p>
              <div className="flex gap-3 wrap" style={{ justifyContent: 'center' }}>
                <Link className="btn btn-primary" to="/auth">
                  Log in
                </Link>
                <Link className="btn btn-secondary" to="/categories">
                  Browse categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const s = stats.data
  const bookmarkTopics = catalog
    ? [...bookmarks].map((id) => catalog.allTopics().find((x) => x.topic.id === id)).filter((x) => x !== undefined)
    : []
  const streak = s?.day_streak ?? 0
  const onTheGo = inProgress.length
  const subtitle =
    onTheGo > 0
      ? `${onTheGo} ${onTheGo === 1 ? 'topic' : 'topics'} on the go${streak > 0 ? ` and a ${streak}-day streak` : ''}. Here's where you left things.`
      : 'Pick any topic to start learning — your progress will show up here.'

  return (
    <main>
      <div className="auth-user-only">
        <div className="container page-head">
          <p className="eyebrow">Your learning</p>
          <h1 style={{ marginTop: 8 }}>
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="ph-desc">{subtitle}</p>
        </div>

        <div className="container section-tight">
          <div className="account-layout">
            <aside className="account-side">
              <div className="side-title">Your learning</div>
              <nav className="flex col" style={{ gap: 2 }} aria-label="Account">
                <Link className="side-link active" to="/dashboard" aria-current="page">
                  <Icon name="grid" className="icon-sm icon" />
                  Overview
                </Link>
                <a className="side-link" href="#continue">
                  <Icon name="play" className="icon-sm icon" />
                  Continue learning
                </a>
                <a className="side-link" href="#bookmarks">
                  <Icon name="bookmark" className="icon-sm icon" />
                  Bookmarks
                </a>
                <Link className="side-link" to="/profile">
                  <Icon name="user" className="icon-sm icon" />
                  Profile &amp; settings
                </Link>
              </nav>
            </aside>

            <div className="account-main">
              <div className="grid grid-4">
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Day streak</span>
                    <Icon name="sparkles" className="icon-sm icon" />
                  </div>
                  <b>{s?.day_streak ?? '–'}</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Lessons done</span>
                    <Icon name="check-circle" className="icon-sm icon" />
                  </div>
                  <b>{s?.lessons_done ?? '–'}</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>This month</span>
                    <Icon name="clock" className="icon-sm icon" />
                  </div>
                  <b>{s ? fmtMins(s.minutes_this_month) : '–'}</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Bookmarks</span>
                    <Icon name="bookmark" className="icon-sm icon" />
                  </div>
                  <b>{s?.bookmark_count ?? '–'}</b>
                </div>
              </div>

              <div id="continue" style={{ marginTop: 32 }}>
                <div className="section-head">
                  <div className="sh-text">
                    <h2 style={{ fontSize: 20 }}>Continue learning</h2>
                  </div>
                </div>
                {inProgress.length > 0 ? (
                  <div className="grid grid-3">
                    {inProgress.slice(0, 3).map(({ ctx, pct, remainingMins }) => (
                      <Link key={ctx.topic.slug} className="card card-hover topic-card" to={topicHref(ctx.topic.slug)}>
                        <span className="tag">{ctx.sub.name}</span>
                        <h3>{ctx.topic.name}</h3>
                        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${ctx.topic.name} progress`}>
                          <span style={{ width: `${pct}%` }}></span>
                        </div>
                        <span className="small muted mono">
                          {pct}% · {fmtMins(remainingMins)} left
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="card card-pad">
                    <p className="small muted">
                      Nothing in progress yet. <Link to="/categories">Browse categories</Link> and start your first topic.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-2" style={{ marginTop: 32 }}>
                <div className="card card-pad" id="bookmarks">
                  <div className="section-head" style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18 }}>Bookmarks</h2>
                  </div>
                  {bookmarkTopics.length > 0 ? (
                    <div className="flex col gap-3">
                      {bookmarkTopics.map((ctx) => (
                        <Link key={ctx.topic.slug} className="row-item" to={topicHref(ctx.topic.slug)}>
                          <span className="row-icon" style={{ background: 'var(--pen-soft)', color: 'var(--pen)' }}>
                            <Icon name={ctx.cat.icon} className="icon-sm icon" />
                          </span>
                          <span className="grow">
                            <span className="small w-600 ink" style={{ display: 'block' }}>
                              {ctx.topic.name}
                            </span>
                            <span className="small muted mono">
                              {fmtMins(ctx.topic.mins)} · {LEVEL_LABEL[ctx.topic.level]}
                            </span>
                          </span>
                          <Icon name="chevron-right" className="icon-sm icon muted" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="small muted">Tap the bookmark icon on any topic to save it here.</p>
                  )}
                </div>

                <div className="card card-pad">
                  <div className="section-head" style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18 }}>Recently viewed</h2>
                  </div>
                  {recent.data && recent.data.length > 0 ? (
                    <ul className="flex col gap-4">
                      {recent.data.map((r) => (
                        <li key={r.topic_slug} className="flex gap-3">
                          <Icon name="clock" className="icon-sm icon muted" />
                          <div>
                            <Link
                              className="small w-600 ink"
                              to={r.lesson_sort ? lessonHref(r.topic_slug, r.lesson_sort) : topicHref(r.topic_slug)}
                            >
                              {r.topic_title}
                              {r.lesson_sort ? ` — lesson ${r.lesson_sort}` : ''}
                            </Link>
                            <div className="small muted">{fmtRelative(r.viewed_at)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="small muted">Lessons you open will show up here.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
