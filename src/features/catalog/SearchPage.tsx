import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import TopicCard from './TopicCard'
import { useDocTitle } from '../../lib/useDocTitle'
import { searchHref } from '../../lib/routes'
import { allTopics, type Level, type TopicContext } from '../../data/mock'

type LevelFilter = Level | 'all'

const LEVEL_CHIPS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

/* AND-match over whitespace-split terms, same haystack as the prototype:
   topic name + desc + subcategory name + category name. */
function matches(x: TopicContext, q: string): boolean {
  if (!q) return true
  const hay = `${x.topic.name} ${x.topic.desc} ${x.sub.name} ${x.cat.name}`.toLowerCase()
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))
}

export default function SearchPage() {
  useDocTitle('Search — Primer')
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const [level, setLevel] = useState<LevelFilter>('all')

  const list = allTopics()
    .filter((x) => matches(x, q))
    .filter((x) => level === 'all' || x.topic.level === level)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = new FormData(e.currentTarget).get('q')
    setParams(typeof next === 'string' && next.trim() ? { q: next.trim() } : {})
  }

  return (
    <main>
      <div className="container page-head">
        <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
        <h1 style={{ marginTop: 12 }}>{q ? `Results for “${q}”` : 'Browse all topics'}</h1>

        <form className="hero-search" role="search" style={{ marginTop: 22, maxWidth: 560 }} onSubmit={onSubmit}>
          <div className="input-wrap grow">
            <Icon name="search" />
            <label className="visually-hidden" htmlFor="search-input">
              Search topics
            </label>
            <input
              key={q}
              className="input"
              type="search"
              id="search-input"
              name="q"
              defaultValue={q}
              placeholder="Search topics, subcategories, categories…"
              autoComplete="off"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="toolbar">
            <div className="filter-row" role="group" aria-label="Filter by difficulty">
              {LEVEL_CHIPS.map((c) => (
                <button key={c.value} className="chip" onClick={() => setLevel(c.value)} aria-pressed={level === c.value}>
                  {c.label}
                </button>
              ))}
            </div>
            <p className="result-count" role="status" aria-live="polite">
              Showing <b>{list.length}</b> {list.length === 1 ? 'topic' : 'topics'}
            </p>
          </div>

          <div className="grid grid-3" style={{ marginTop: 6 }}>
            {list.slice(0, 12).map((ctx) => (
              <TopicCard key={ctx.topic.slug} ctx={ctx} />
            ))}
          </div>

          {list.length > 12 ? (
            <p className="small muted" style={{ marginTop: 16, textAlign: 'center' }}>
              Showing the first 12 results — refine your search to narrow things down.
            </p>
          ) : null}

          {list.length === 0 ? (
            <div className="card" style={{ marginTop: 6 }}>
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="search" />
                </div>
                <h3>No topics found</h3>
                <p className="small" style={{ maxWidth: 400 }}>
                  Nothing matches that search and filter combination. Try a broader term, or browse by category instead.
                </p>
                <div className="flex gap-2 wrap" style={{ justifyContent: 'center' }}>
                  <Link className="tag" to={searchHref('javascript')}>
                    JavaScript
                  </Link>
                  <Link className="tag" to={searchHref('design')}>
                    Design
                  </Link>
                  <Link className="tag" to={searchHref('python')}>
                    Python
                  </Link>
                  <Link className="tag" to={searchHref('speaking')}>
                    Public speaking
                  </Link>
                </div>
                <Link className="btn btn-secondary btn-sm" to="/categories">
                  Browse all categories
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
