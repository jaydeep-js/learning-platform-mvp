import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { topicHref } from '../../lib/routes'
import { TOPICS_PAGE_SIZE, useAdminTopics, useDeleteTopic, type AdminTopicListRow } from '../../data/admin'

const STATUS_LABEL = { published: 'Published', draft: 'Draft', review: 'In review' } as const

const CHIPS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminTopicsPage() {
  useDocTitle('Topics — Primer Admin')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<AdminTopicListRow | null>(null)
  /* Server-side: ilike search + status filter + .range() pagination. */
  const topics = useAdminTopics(q.trim(), status, page)
  const remove = useDeleteTopic()

  if (topics.isPending && !topics.data) return <PageLoading />
  if (topics.isError) return <PageError onRetry={() => void topics.refetch()} />

  const { rows, total } = topics.data
  const pageCount = Math.max(1, Math.ceil(total / TOPICS_PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

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
            {rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <span className="td-title">{t.title}</span>
                </td>
                <td>{t.subcategories?.name ?? 'Unassigned'}</td>
                <td className="mono">{t.topic_lessons[0]?.count ?? 0}</td>
                <td>
                  <span className={`pill pill-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </td>
                <td className="mono">{fmtDate(t.updated_at)}</td>
                <td>
                  <div className="td-actions">
                    <Link className="btn-icon" to={topicHref(t.slug)} aria-label={`Preview ${t.title}`}>
                      <Icon name="eye" className="icon-sm icon" />
                    </Link>
                    <Link className="btn-icon" to={`/admin/topics/${t.slug}/edit`} aria-label={`Edit ${t.title}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </Link>
                    <button className="btn-icon danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.title}`}>
                      <Icon name="trash" className="icon-sm icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 ? (
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
          Showing <b className="mono ink">{rows.length}</b> of <b className="mono ink">{total}</b> topics
        </span>
        <div className="pagination">
          <button className="page-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
            <Icon name="chevron-left" className="icon-sm icon" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === safePage ? 'page-btn active' : 'page-btn'} aria-current={p === safePage ? 'page' : undefined} onClick={() => setPage(p)}>
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
            disabled={remove.isPending}
            onClick={() => {
              if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
            }}
          >
            {remove.isPending ? 'Deleting…' : 'Delete topic'}
          </button>
        </div>
      </Modal>
    </>
  )
}
