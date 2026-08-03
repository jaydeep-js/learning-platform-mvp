import { useState } from 'react'
import { useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import TopicCard from './TopicCard'
import NotFoundPage from './NotFoundPage'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { fmtMins } from '../../lib/format'
import { catHref } from '../../lib/routes'
import { useCatalog } from '../../data/catalog'
import type { Level } from '../../data/mock'

type LevelFilter = Level | 'all'
type Sort = 'recommended' | 'shortest' | 'az'

const LEVEL_CHIPS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'shortest', label: 'Shortest first' },
  { value: 'az', label: 'A–Z' },
]

export default function SubcategoryPage() {
  const { subcategorySlug = '' } = useParams()
  const [level, setLevel] = useState<LevelFilter>('all')
  const [sort, setSort] = useState<Sort>('recommended')
  const { catalog, isLoading, isError, refetch } = useCatalog()
  const found = catalog?.findSub(subcategorySlug)
  useDocTitle(found ? `${found.sub.name} — Primer` : 'Primer')
  if (isLoading) return <PageLoading />
  if (isError || !catalog) return <PageError onRetry={() => void refetch()} />
  if (!found) return <NotFoundPage />

  const { cat, sub } = found
  const topics = catalog.topicsFor(sub.slug).map((topic) => ({ cat, sub, topic }))
  const totalMins = topics.reduce((a, x) => a + x.topic.mins, 0)

  /* Filter + sort derived during render — never mirrored into state. */
  let list = topics.filter((x) => level === 'all' || x.topic.level === level)
  if (sort === 'shortest') list = list.toSorted((a, b) => a.topic.mins - b.topic.mins)
  if (sort === 'az') list = list.toSorted((a, b) => a.topic.name.localeCompare(b.topic.name))

  return (
    <main>
      <div className="container page-head">
        <Crumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/categories' },
            { label: cat.name, href: catHref(cat.slug) },
            { label: sub.name },
          ]}
        />
        <div className="ph-row">
          <div>
            <h1 style={{ marginTop: 6 }}>{sub.name}</h1>
            <p className="ph-desc">
              {sub.desc} Part of the {cat.name} category.
            </p>
            <div className="ph-meta">
              <span>
                <b>{topics.length}</b> topics
              </span>
              <span>
                <b>{fmtMins(totalMins)}</b> total
              </span>
            </div>
          </div>
        </div>
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
            <div className="sort-group" role="group" aria-label="Sort topics">
              {SORTS.map((s) => (
                <button key={s.value} className="sort-btn" onClick={() => setSort(s.value)} aria-pressed={sort === s.value}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <p className="result-count" role="status" aria-live="polite">
            Showing <b>{list.length}</b> of <b>{topics.length}</b> topics
          </p>

          <div className="grid grid-3" style={{ marginTop: 14 }}>
            {list.map((ctx) => (
              <TopicCard key={ctx.topic.slug} ctx={ctx} />
            ))}
          </div>

          {list.length === 0 ? (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="filter" />
                </div>
                <h3>No topics at this level</h3>
                <p className="small" style={{ maxWidth: 360 }}>
                  Nothing here matches that difficulty. Switch back to all levels to see the full list.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setLevel('all')}>
                  Show all levels
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
