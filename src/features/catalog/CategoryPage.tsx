import { Link, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import TopicCard from './TopicCard'
import NotFoundPage from './NotFoundPage'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { fmtMins } from '../../lib/format'
import { subHref, topicHref } from '../../lib/routes'
import { getCategory, progressOf, topicCounts, topicsFor, type TopicContext } from '../../data/mock'

export default function CategoryPage() {
  const { categorySlug = '' } = useParams()
  const { user } = useAuth()
  const cat = getCategory(categorySlug)
  useDocTitle(cat ? `${cat.name} — Primer` : 'Primer')
  if (!cat) return <NotFoundPage />

  const counts = topicCounts(cat.slug)
  const featured: TopicContext[] = cat.subs.flatMap((sub) => topicsFor(sub.slug).map((topic) => ({ cat, sub, topic })))
  const sorted = featured.toSorted((a, b) => progressOf(b.topic.slug) - progressOf(a.topic.slug))
  const resume = user
    ? featured.find((x) => {
        const p = progressOf(x.topic.slug)
        return p > 0 && p < 100
      })
    : undefined

  return (
    <main>
      <div className="container page-head">
        <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: cat.name }]} />
        <div className="ph-row">
          <div>
            <h1 style={{ marginTop: 6 }}>{cat.name}</h1>
            <p className="ph-desc">{cat.desc}</p>
            <div className="ph-meta">
              <span>
                <b>{cat.subs.length}</b> subcategories
              </span>
              <span>
                <b>{counts.topics}</b> topics
              </span>
              <span>
                <b>{fmtMins(counts.mins)}</b> of material
              </span>
            </div>
          </div>
        </div>

        {resume ? (
          <div className="resume auth-user-only">
            <div>
              <div className="r-label">Pick up where you left off</div>
              <div className="r-title">
                {resume.topic.name} · {fmtMins(Math.round((resume.topic.mins * (100 - progressOf(resume.topic.slug))) / 100))} left
              </div>
            </div>
            <Link className="btn btn-primary btn-sm" to={topicHref(resume.topic.slug)}>
              Continue <Icon name="arrow-right" className="icon-sm icon" />
            </Link>
          </div>
        ) : null}
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div className="sh-text">
              <p className="eyebrow">Step 2 of the path</p>
              <h2>Subcategories</h2>
            </div>
          </div>
          <div className="grid grid-3">
            {cat.subs.map((sub) => (
              <Link key={sub.slug} className="card card-hover cat-card" to={subHref(cat.slug, sub.slug)}>
                <div className="cat-icon" style={{ background: cat.tint, color: cat.tintInk }}>
                  <Icon name={cat.icon} />
                </div>
                <h3>{sub.name}</h3>
                <p className="small" style={{ color: 'var(--body)' }}>
                  {sub.desc}
                </p>
                <div className="cat-count small muted">
                  <span className="mono">{topicsFor(sub.slug).length}</span> topics
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="section-head">
            <div className="sh-text">
              <p className="eyebrow">Most started in this category</p>
              <h2>Featured topics</h2>
            </div>
          </div>
          <div className="grid grid-3">
            {sorted.slice(0, 6).map((ctx) => (
              <TopicCard key={ctx.topic.slug} ctx={ctx} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
