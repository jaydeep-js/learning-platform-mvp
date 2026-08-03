import { useState } from 'react'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { CATEGORIES, topicsFor, type Subcategory } from '../../data/mock'

const PAGE_SIZE = 20

interface Row {
  sub: Subcategory
  parent: string
}

const ROWS: Row[] = CATEGORIES.flatMap((cat) => cat.subs.map((sub) => ({ sub, parent: cat.name })))

export default function AdminSubcategoriesPage() {
  useDocTitle('Subcategories — Primer Admin')
  const toast = useToast()
  const [parent, setParent] = useState('all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)

  const filtered = ROWS.filter((r) => parent === 'all' || r.parent === parent)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const editRow = editing !== null && editing !== 'new' ? editing : null

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>Subcategories</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            The middle layer of the path: each belongs to one category and holds its topics.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" className="icon-sm icon" />
          Add subcategory
        </button>
      </div>

      <div className="toolbar">
        <div className="field" style={{ maxWidth: 240 }}>
          <label className="visually-hidden" htmlFor="parent-filter">
            Filter by category
          </label>
          <select
            className="select"
            id="parent-filter"
            value={parent}
            onChange={(e) => {
              setParent(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subcategory</th>
              <th>Parent category</th>
              <th>Topics</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.sub.slug}>
                <td>
                  <span className="td-title">{r.sub.name}</span>
                </td>
                <td>{r.parent}</td>
                <td className="mono">{topicsFor(r.sub.slug).length}</td>
                <td>
                  <div className="td-actions">
                    <button className="btn-icon" onClick={() => setEditing(r)} aria-label={`Edit ${r.sub.name}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </button>
                    <button className="btn-icon danger" onClick={() => setDeleting(r)} aria-label={`Delete ${r.sub.name}`}>
                      <Icon name="trash" className="icon-sm icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex center between wrap" style={{ marginTop: 16, gap: 12 }}>
        <span className="small muted">
          Showing <b className="mono ink">{visible.length}</b> of <b className="mono ink">{filtered.length}</b> subcategories
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

      {/* Edit / add subcategory */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="sub-modal-title">
        <div className="flex center between">
          <h2 id="sub-modal-title" style={{ fontSize: 19 }}>
            {editing === 'new' ? 'Add subcategory' : 'Edit subcategory'}
          </h2>
          <button className="btn-icon" onClick={() => setEditing(null)} aria-label="Close">
            <Icon name="x" className="icon-sm icon" />
          </button>
        </div>
        <div className="flex col gap-4" style={{ marginTop: 20 }}>
          <div className="field">
            <label className="label" htmlFor="sub-name">
              Name
            </label>
            <input key={editRow?.sub.slug ?? 'new'} className="input" id="sub-name" defaultValue={editRow?.sub.name ?? ''} />
          </div>
          <div className="field">
            <label className="label" htmlFor="sub-parent">
              Parent category
            </label>
            <select key={editRow?.sub.slug ?? 'new'} className="select" id="sub-parent" defaultValue={editRow?.parent ?? CATEGORIES[0].name}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="sub-desc">
              Description
            </label>
            <textarea key={editRow?.sub.slug ?? 'new'} className="textarea" id="sub-desc" rows={2} defaultValue={editRow?.sub.desc ?? ''}></textarea>
          </div>
        </div>
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-block" onClick={() => setEditing(null)}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              setEditing(null)
              toast('Subcategory saved')
            }}
          >
            Save changes
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleting !== null} onClose={() => setDeleting(null)} labelledBy="sdel-modal-title">
        <div className="modal-icon">
          <Icon name="trash" />
        </div>
        <h2 id="sdel-modal-title" style={{ fontSize: 19 }}>
          Delete this subcategory?
        </h2>
        <p className="small" style={{ marginTop: 8 }}>
          Its topics will be unlinked and hidden from learners until they're moved to another subcategory. This can't be undone.
        </p>
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-block" onClick={() => setDeleting(null)}>
            Cancel
          </button>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              setDeleting(null)
              toast('Subcategory deleted')
            }}
          >
            Delete subcategory
          </button>
        </div>
      </Modal>
    </>
  )
}
