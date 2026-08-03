import { useState } from 'react'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { CATEGORIES, topicCounts, type Category } from '../../data/mock'

/* Mock "Updated" dates — real updated_at lands in M4. */
const UPDATED = ['Jul 29, 2026', 'Jul 26, 2026', 'Jul 22, 2026', 'Jul 20, 2026', 'Jul 18, 2026', 'Jul 15, 2026', 'Jul 12, 2026', 'Jul 10, 2026']

export default function AdminCategoriesPage() {
  useDocTitle('Categories — Primer Admin')
  const toast = useToast()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const editCat = editing !== null && editing !== 'new' ? editing : null

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>Categories</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            Top-level subjects learners browse from Home and All Categories.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" className="icon-sm icon" />
          Add category
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Subcategories</th>
              <th>Topics</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, i) => (
              <tr key={cat.slug}>
                <td>
                  <span className="td-title">{cat.name}</span>
                </td>
                <td className="mono">{cat.subs.length}</td>
                <td className="mono">{topicCounts(cat.slug).topics}</td>
                <td className="mono">{UPDATED[i]}</td>
                <td>
                  <div className="td-actions">
                    <button className="btn-icon" onClick={() => setEditing(cat)} aria-label={`Edit ${cat.name}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </button>
                    <button className="btn-icon danger" onClick={() => setDeleting(cat)} aria-label={`Delete ${cat.name}`}>
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
          Showing <b className="mono ink">{CATEGORIES.length}</b> of <b className="mono ink">{CATEGORIES.length}</b> categories
        </span>
      </div>

      {/* Edit / add category */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="cat-modal-title">
        <div className="flex center between">
          <h2 id="cat-modal-title" style={{ fontSize: 19 }}>
            {editing === 'new' ? 'Add category' : 'Edit category'}
          </h2>
          <button className="btn-icon" onClick={() => setEditing(null)} aria-label="Close">
            <Icon name="x" className="icon-sm icon" />
          </button>
        </div>
        <div className="flex col gap-4" style={{ marginTop: 20 }}>
          <div className="field">
            <label className="label" htmlFor="cat-name">
              Name
            </label>
            <input key={editCat?.slug ?? 'new'} className="input" id="cat-name" defaultValue={editCat?.name ?? ''} />
          </div>
          <div className="field">
            <label className="label" htmlFor="cat-desc">
              Description
            </label>
            <textarea key={editCat?.slug ?? 'new'} className="textarea" id="cat-desc" rows={3} defaultValue={editCat?.desc ?? ''}></textarea>
            <p className="hint">Shown on the category card and category page header.</p>
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
              toast('Category saved')
            }}
          >
            Save changes
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleting !== null} onClose={() => setDeleting(null)} labelledBy="del-modal-title">
        <div className="modal-icon">
          <Icon name="trash" />
        </div>
        <h2 id="del-modal-title" style={{ fontSize: 19 }}>
          Delete this category?
        </h2>
        <p className="small" style={{ marginTop: 8 }}>
          This permanently removes the category, its subcategories, and unlinks its topics. Learner progress tied to those topics is also cleared. This can't be undone.
        </p>
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-block" onClick={() => setDeleting(null)}>
            Cancel
          </button>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              setDeleting(null)
              toast('Category deleted')
            }}
          >
            Delete category
          </button>
        </div>
      </Modal>
    </>
  )
}
