import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { topicHref } from '../../lib/routes'
import { allTopics, type TopicContext } from '../../data/mock'

const PAGE_SIZE = 20

/* M0 mock statuses — the topic_status column arrives in M1; a few non-published
   rows keep the filter chips demonstrable, mirroring the prototype's demo rows. */
const MOCK_STATUS: Record<string, { status: 'draft' | 'review'; label: string }> = {
  'ml-foundations-foundations': { status: 'draft', label: 'Draft' },
  'public-speaking-foundations': { status: 'review', label: 'In review' },
  'ui-design-foundations': { status: 'draft', label: 'Draft' },
}

const MOCK_DATES = ['Jul 29, 2026', 'Jul 28, 2026', 'Jul 25, 2026', 'Aug 1, 2026', 'Jul 30, 2026', 'Jul 21, 2026', 'Jul 18, 2026', 'Jul 15, 2026']

function statusOf(slug: string): { status: string; label: string } {
  return MOCK_STATUS[slug] ?? { status: 'published', label: 'Published' }
}

export default function AdminTopicsPage() {
  useDocTitle('Topics — Primer Admin')
  const toast = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<TopicContext | null>(null)

  const filtered = allTopics().filter((x) => {
    const okQ = !q || x.topic.name.toLowerCase().includes(q.toLowerCase())
    const okS = status === 'all' || statusOf(x.topic.slug).status === status
    return okQ && okS
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const CHIPS = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In review' },
  ]

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>Topics</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            All learner-facing content. Edit opens the full-page editor.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/topics/new">
          <Icon name="plus" className="icon-sm icon" />
          New topic
        </Link>
      </div>

      <div className="toolbar">
        <div className="input-wrap" style={{ width: 260 }}>
          <Icon name="search" />
          <label className="visually-hidden" htmlFor="topic-search">
            Search topics
          </label>
          <input
            className="input"
            id="topic-search"
            type="search"
            placeholder="Search topics…"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="filter-row" role="group" aria-label="Filter by status">
          {CHIPS.map((c) => (
            <button
              key={c.value}
              className="chip"
              aria-pressed={status === c.value}
              onClick={() => {
                setStatus(c.value)
                setPage(1)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Subcategory</th>
              <th>Lessons</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((x, i) => {
              const s = statusOf(x.topic.slug)
              return (
                <tr key={x.topic.slug}>
                  <td>
                    <span className="td-title">{x.topic.name}</span>
                  </td>
                  <td>{x.sub.name}</td>
                  <td className="mono">{x.topic.lessons}</td>
                  <td>
                    <span className={`pill pill-${s.status}`}>{s.label}</span>
                  </td>
                  <td className="mono">{MOCK_DATES[i % MOCK_DATES.length]}</td>
                  <td>
                    <div className="td-actions">
                      <Link className="btn-icon" to={topicHref(x.topic.slug)} aria-label={`Preview ${x.topic.name}`}>
                        <Icon name="eye" className="icon-sm icon" />
                      </Link>
                      <Link className="btn-icon" to={`/admin/topics/${x.topic.slug}/edit`} aria-label={`Edit ${x.topic.name}`}>
                        <Icon name="edit" className="icon-sm icon" />
                      </Link>
                      <button className="btn-icon danger" onClick={() => setDeleting(x)} aria-label={`Delete ${x.topic.name}`}>
                        <Icon name="trash" className="icon-sm icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="empty">
            <div className="empty-icon">
              <Icon name="search" />
            </div>
            <h3>No topics match</h3>
            <p className="small">Try a different search term or status filter.</p>
          </div>
        </div>
      ) : null}

      <div className="flex center between wrap" style={{ marginTop: 16, gap: 12 }}>
        <span className="small muted">
          Showing <b className="mono ink">{visible.length}</b> of <b className="mono ink">{filtered.length}</b> topics
        </span>
        <div className="pagination">
          <button className="page-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
            <Icon name="chevron-left" className="icon-sm icon" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === safePage ? 'page-btn active' : 'page-btn'}
              aria-current={p === safePage ? 'page' : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="page-btn" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} aria-label="Next page">
            <Icon name="chevron-right" className="icon-sm icon" />
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      <Modal open={deleting !== null} onClose={() => setDeleting(null)} labelledBy="tdel-modal-title">
        <div className="modal-icon">
          <Icon name="trash" />
        </div>
        <h2 id="tdel-modal-title" style={{ fontSize: 19 }}>
          Delete this topic?
        </h2>
        <p className="small" style={{ marginTop: 8 }}>
          This permanently removes the topic and all of its lesson content. Learner progress tied to it is also cleared. This can't be undone.
        </p>
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-block" onClick={() => setDeleting(null)}>
            Cancel
          </button>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              setDeleting(null)
              toast('Topic deleted')
            }}
          >
            Delete topic
          </button>
        </div>
      </Modal>
    </>
  )
}
