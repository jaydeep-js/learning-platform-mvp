import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { useAdminOverview } from '../../data/admin'

const STATUS_LABEL = { published: 'Published', draft: 'Draft', review: 'In review' } as const

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminDashboardPage() {
  useDocTitle('Admin dashboard — Primer')
  const overview = useAdminOverview()
  if (overview.isPending) return <PageLoading />
  if (overview.isError) return <PageError onRetry={() => void overview.refetch()} />

  const { categories, subcategories, topics } = overview.data
  const published = topics.filter((t) => t.status === 'published').length
  const drafts = topics.filter((t) => t.status !== 'published').length
  const recent = topics.slice(0, 4)
  const queue = topics.filter((t) => t.status !== 'published').slice(0, 5)

  const catName = (subcategoryId: number | null) => {
    const sub = subcategories.find((s) => s.id === subcategoryId)
    return categories.find((c) => c.id === sub?.category_id)?.name ?? 'Unassigned'
  }

  const byCategory = categories
    .map((c) => ({
      name: c.name,
      count: topics.filter((t) => {
        const sub = subcategories.find((s) => s.id === t.subcategory_id)
        return sub?.category_id === c.id
      }).length,
    }))
    .toSorted((a, b) => b.count - a.count)
  const topFour = byCategory.slice(0, 4)
  const rest = byCategory.slice(4).reduce((a, c) => a + c.count, 0)

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>Dashboard</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            Overview of your content and publishing pipeline.
          </p>
        </div>
        <div className="flex gap-2 wrap">
          <Link className="btn btn-secondary" to="/admin/topics">
            Manage topics
          </Link>
          <Link className="btn btn-primary" to="/admin/topics/new">
            <Icon name="plus" className="icon-sm icon" />
            New topic
          </Link>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-top">
            <span>Total topics</span>
            <Icon name="file-text" className="icon-sm icon" />
          </div>
          <b>{topics.length}</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Published</span>
            <svg className="icon-sm icon" style={{ color: 'var(--green)' }} aria-hidden="true">
              <use href="#i-check-circle" />
            </svg>
          </div>
          <b>{published}</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Drafts</span>
            <svg className="icon-sm icon" style={{ color: 'var(--amber)' }} aria-hidden="true">
              <use href="#i-edit" />
            </svg>
          </div>
          <b>{drafts}</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Categories</span>
            <Icon name="folder" className="icon-sm icon" />
          </div>
          <b>{categories.length}</b>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <div className="sh-text">
          <h2 style={{ fontSize: 18 }}>Recently updated topics</h2>
        </div>
        <Link className="section-link" to="/admin/topics">
          View all topics <Icon name="arrow-right" className="icon-sm icon" />
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t.id}>
                <td>
                  <span className="td-title">{t.title}</span>
                </td>
                <td>{catName(t.subcategory_id)}</td>
                <td>
                  <span className={`pill pill-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </td>
                <td className="mono">{fmtDate(t.updated_at)}</td>
                <td>
                  <div className="td-actions">
                    <Link className="btn-icon" to={`/admin/topics/${t.slug}/edit`} aria-label={`Edit ${t.title}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 16 }}>Content by category</h2>
          <ul className="flex col" style={{ gap: 12, marginTop: 16 }}>
            {topFour.map((c) => (
              <li key={c.name} className="flex center between small">
                <span>{c.name}</span>
                <b className="mono ink">{c.count} topics</b>
              </li>
            ))}
            {rest > 0 ? (
              <li className="flex center between small">
                <span>Everything else</span>
                <b className="mono ink">{rest} topics</b>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="card card-pad">
          <h2 style={{ fontSize: 16 }}>Publishing queue</h2>
          <p className="small muted" style={{ marginTop: 6 }}>
            Drafts waiting on review before they go live.
          </p>
          <ul className="flex col" style={{ gap: 12, marginTop: 16 }}>
            {queue.length > 0 ? (
              queue.map((t) => (
                <li key={t.id} className="flex center between small">
                  <span>{t.title}</span>
                  <span className={`pill pill-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </li>
              ))
            ) : (
              <li className="small muted">Nothing waiting — everything is live.</li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}
