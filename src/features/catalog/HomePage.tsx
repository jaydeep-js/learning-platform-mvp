import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../../components/icons/Icon'
import TopicCard from './TopicCard'
import CategoryCard from './CategoryCard'
import { useAuth } from '../auth/AuthProvider'
import { fmtMins } from '../../lib/format'
import { catHref, lessonHref, searchHref, subHref, topicHref } from '../../lib/routes'
import { CATEGORIES, findTopic, progressOf } from '../../data/mock'

/* Curated picks, same slugs the prototype hardcodes. */
const POPULAR_PICKS = ['javascript-basics', 'react-fundamentals', 'ui-design-foundations']
const CONTINUE_PICKS = ['css-flexbox-mastery', 'javascript-basics', 'python-for-beginners']

const PATH_STEPS = [
  { icon: 'grid', kind: 'Category', name: 'Programming', href: catHref('programming'), sub: 'One of 8 subjects · 6 subcategories', hot: false },
  { icon: 'layers', kind: 'Subcategory', name: 'JavaScript', href: subHref('programming', 'javascript'), sub: '6 topics, beginner to advanced', hot: false },
  { icon: 'file-text', kind: 'Topic', name: 'JavaScript Basics', href: topicHref('javascript-basics'), sub: '13 lessons in 4 units · 3h 20m', hot: true },
  { icon: 'play', kind: 'Lesson', name: 'Your first script', href: lessonHref('javascript-basics', 3), sub: '10 minutes · progress saved as you go', hot: false },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')
    navigate(searchHref(typeof q === 'string' ? q.trim() : ''))
  }

  return (
    <main>
      {/* Hero: thesis + the shape of the whole app, clickable */}
      <section className="hero">
        <div className="container">
          <div>
            <p className="eyebrow">A content-based learning platform</p>
            <h1 style={{ marginTop: 14 }}>
              Learn it once,
              <br />
              <span className="mark">properly</span>.
            </h1>
            <p className="hero-sub">
              Every subject on Primer is organized the same way: pick a category, narrow to a subcategory, choose a topic, and work through its lessons in order. No guessing what comes next.
            </p>
            <form className="hero-search" role="search" onSubmit={onSearch}>
              <div className="input-wrap grow">
                <Icon name="search" />
                <label className="visually-hidden" htmlFor="hero-q">
                  Search topics
                </label>
                <input className="input" type="search" id="hero-q" name="q" placeholder='Try "JavaScript", "UI design", or "investing"…' autoComplete="off" />
              </div>
              <button className="btn btn-primary btn-lg" type="submit">
                Search
              </button>
            </form>
            <div className="hero-pop">
              <span className="small muted">Popular:</span>
              <Link className="tag" to={searchHref('javascript')}>
                JavaScript
              </Link>
              <Link className="tag" to={searchHref('ui design')}>
                UI Design
              </Link>
              <Link className="tag" to={searchHref('python')}>
                Python
              </Link>
              <Link className="tag" to={searchHref('investing')}>
                Investing
              </Link>
            </div>
          </div>

          <div className="path-map" aria-label="How Primer is organized">
            {PATH_STEPS.map((s) => (
              <div key={s.kind} className={s.hot ? 'path-step hot' : 'path-step'}>
                <span className="path-dot">
                  <Icon name={s.icon} />
                </span>
                <div className="path-body">
                  <div className="path-kind">{s.kind}</div>
                  <Link className="path-name" to={s.href}>
                    {s.name} <Icon name="arrow-right" className="icon-sm icon" />
                  </Link>
                  <div className="path-sub">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Continue learning (signed-in only) */}
      {user ? (
        <section className="section-tight auth-user-only">
          <div className="container">
            <div className="section-head">
              <div className="sh-text">
                <p className="eyebrow">Picking up where you left off</p>
                <h2>Continue learning</h2>
              </div>
              <Link className="section-link" to="/dashboard">
                Go to dashboard <Icon name="arrow-right" className="icon-sm icon" />
              </Link>
            </div>
            <div className="grid grid-3">
              {CONTINUE_PICKS.map((slug) => {
                const ctx = findTopic(slug)
                if (!ctx) return null
                const pct = progressOf(slug)
                return (
                  <Link key={slug} className="card card-hover topic-card" to={topicHref(slug)}>
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
        </section>
      ) : null}

      {/* Categories */}
      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          <div className="section-head">
            <div className="sh-text">
              <p className="eyebrow">8 subjects, one structure</p>
              <h2>Browse by category</h2>
            </div>
            <Link className="section-link" to="/categories">
              All categories <Icon name="arrow-right" className="icon-sm icon" />
            </Link>
          </div>
          <div className="grid grid-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular topics */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="sh-text">
              <p className="eyebrow">Where most learners start</p>
              <h2>Popular topics</h2>
            </div>
            <Link className="section-link" to="/search">
              Browse everything <Icon name="arrow-right" className="icon-sm icon" />
            </Link>
          </div>
          <div className="grid grid-3">
            {POPULAR_PICKS.map((slug) => {
              const ctx = findTopic(slug)
              return ctx ? <TopicCard key={slug} ctx={ctx} /> : null
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-tight">
        <div className="container">
          <div className="stats-strip">
            <div>
              <b>1,240+</b>
              <span className="small muted">Lessons</span>
            </div>
            <div>
              <b>128</b>
              <span className="small muted">Topics</span>
            </div>
            <div>
              <b>10,400+</b>
              <span className="small muted">Learners</span>
            </div>
            <div>
              <b>95%</b>
              <span className="small muted">Finish what they start</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest conversion */}
      {!user ? (
        <section className="section-tight auth-guest-only">
          <div className="container">
            <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 20 }}>
                  Keep your <span className="mark mark-sm">progress</span>, not just your place.
                </h3>
                <p className="small" style={{ marginTop: 6, maxWidth: 520 }}>
                  You can browse every category and read lessons as a guest. Create a free account to track completed lessons, save bookmarks, and pick up exactly where you left off.
                </p>
              </div>
              <div className="flex gap-3 wrap">
                <Link className="btn btn-primary" to="/auth">
                  Create free account
                </Link>
                <Link className="btn btn-secondary" to="/auth">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
