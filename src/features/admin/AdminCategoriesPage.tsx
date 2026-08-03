import { useState } from 'react'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { useAdminOverview, useDeleteCategory, useSaveCategory, type AdminCategory } from '../../data/admin'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminCategoriesPage() {
  useDocTitle('Categories — Primer Admin')
  const overview = useAdminOverview()
  const save = useSaveCategory()
  const remove = useDeleteCategory()
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)

  if (overview.isPending) return <PageLoading />
  if (overview.isError) return <PageError onRetry={() => void overview.refetch()} />

  const { categories, subcategories, topics } = overview.data
  const editCat = editing !== null && editing !== 'new' ? editing : null

  const subCount = (catId: number) => subcategories.filter((s) => s.category_id === catId).length
  const topicCount = (catId: number) =>
    topics.filter((t) => {
      const sub = subcategories.find((s) => s.id === t.subcategory_id)
      return sub?.category_id === catId
    }).length

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    save.mutate(
      {
        id: editCat?.id,
        name: String(form.get('name') ?? '').trim(),
        description: String(form.get('description') ?? '').trim(),
        sortOrder: categories.length + 1,
      },
      { onSuccess: () => setEditing(null) },
    )
  }

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
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <span className="td-title">{cat.name}</span>
                </td>
                <td className="mono">{subCount(cat.id)}</td>
                <td className="mono">{topicCount(cat.id)}</td>
                <td className="mono">{fmtDate(cat.updated_at)}</td>
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
          Showing <b className="mono ink">{categories.length}</b> of <b className="mono ink">{categories.length}</b> categories
        </span>
      </div>

      {/* Edit / add category */}
      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="cat-modal-title">
        <form onSubmit={onSave}>
          <div className="flex center between">
            <h2 id="cat-modal-title" style={{ fontSize: 19 }}>
              {editing === 'new' ? 'Add category' : 'Edit category'}
            </h2>
            <button className="btn-icon" type="button" onClick={() => setEditing(null)} aria-label="Close">
              <Icon name="x" className="icon-sm icon" />
            </button>
          </div>
          <div className="flex col gap-4" style={{ marginTop: 20 }}>
            <div className="field">
              <label className="label" htmlFor="cat-name">
                Name
              </label>
              <input key={editCat?.id ?? 'new'} className="input" id="cat-name" name="name" required defaultValue={editCat?.name ?? ''} />
            </div>
            <div className="field">
              <label className="label" htmlFor="cat-desc">
                Description
              </label>
              <textarea key={editCat?.id ?? 'new'} className="textarea" id="cat-desc" name="description" rows={3} defaultValue={editCat?.description ?? ''}></textarea>
              <p className="hint">Shown on the category card and category page header.</p>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 24 }}>
            <button className="btn btn-secondary btn-block" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-block" type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
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
            disabled={remove.isPending}
            onClick={() => {
              if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
            }}
          >
            {remove.isPending ? 'Deleting…' : 'Delete category'}
          </button>
        </div>
      </Modal>
    </>
  )
}
