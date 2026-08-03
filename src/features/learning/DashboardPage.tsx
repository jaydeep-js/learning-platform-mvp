import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { fmtMins } from '../../lib/format'
import { lessonHref, topicHref } from '../../lib/routes'
import { BOOKMARKS, findTopic, progressOf, allTopics } from '../../data/mock'

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as const

/* Mock recently-viewed feed — becomes the recent_views table in M3. */
const RECENT = [
  { label: 'CSS Flexbox Mastery — lesson 7', href: lessonHref('css-flexbox-mastery', 7), when: 'Today, 2:14 PM' },
  { label: 'JavaScript Basics — lesson 3', href: lessonHref('javascript-basics', 3), when: 'Today, 1:52 PM' },
  { label: 'Python for Beginners', href: topicHref('python-for-beginners'), when: 'Yesterday' },
  { label: 'Introduction to HTML', href: topicHref('intro-to-html'), when: '2 days ago' },
]

export default function DashboardPage() {
  useDocTitle('Dashboard — Primer')
  const { user } = useAuth()

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

  const inProgress = allTopics().filter((x) => {
    const p = progressOf(x.topic.slug)
    return p > 0 && p < 100
  })
  const bookmarks = BOOKMARKS.map((slug) => findTopic(slug)).filter((x) => x !== null)

  return (
    <main>
      <div className="auth-user-only">
        <div className="container page-head">
          <p className="eyebrow">Your learning</p>
          <h1 style={{ marginTop: 8 }}>Good afternoon, {user.name.split(' ')[0]}</h1>
          <p className="ph-desc">Three topics on the go and a five-day streak. Here's where you left things.</p>
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
                  <b>5</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Lessons done</span>
                    <Icon name="check-circle" className="icon-sm icon" />
                  </div>
                  <b>34</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>This month</span>
                    <Icon name="clock" className="icon-sm icon" />
                  </div>
                  <b>18h</b>
                </div>
                <div className="card stat-card">
                  <div className="stat-top">
                    <span>Bookmarks</span>
                    <Icon name="bookmark" className="icon-sm icon" />
                  </div>
                  <b>{bookmarks.length}</b>
                </div>
              </div>

              <div id="continue" style={{ marginTop: 32 }}>
                <div className="section-head">
                  <div className="sh-text">
                    <h2 style={{ fontSize: 20 }}>Continue learning</h2>
                  </div>
                </div>
                <div className="grid grid-3">
                  {inProgress.map((ctx) => {
                    const pct = progressOf(ctx.topic.slug)
                    return (
                      <Link key={ctx.topic.slug} className="card card-hover topic-card" to={topicHref(ctx.topic.slug)}>
                        <span className="tag">{ctx.sub.name}</span>
                        <h3>{ctx.topic.name}</h3>
                        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${ctx.topic.name} progress`}>
                          <span style={{ width: `${pct}%` }}></span>
                        </div>
                        <span className="small muted mono">
                          {pct}% · {fmtMins(Math.round((ctx.topic.mins * (100 - pct)) / 100))} left
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-2" style={{ marginTop: 32 }}>
                <div className="card card-pad" id="bookmarks">
                  <div className="section-head" style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18 }}>Bookmarks</h2>
                  </div>
                  <div className="flex col gap-3">
                    {bookmarks.map((ctx) => (
                      <Link key={ctx.topic.slug} className="row-item" to={topicHref(ctx.topic.slug)}>
                        <span className="row-icon" style={{ background: 'var(--pen-soft)', color: 'var(--pen)' }}>
                          <Icon name="code" className="icon-sm icon" />
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
                </div>

                <div className="card card-pad">
                  <div className="section-head" style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18 }}>Recently viewed</h2>
                  </div>
                  <ul className="flex col gap-4">
                    {RECENT.map((r) => (
                      <li key={r.label} className="flex gap-3">
                        <Icon name="clock" className="icon-sm icon muted" />
                        <div>
                          <Link className="small w-600 ink" to={r.href}>
                            {r.label}
                          </Link>
                          <div className="small muted">{r.when}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
