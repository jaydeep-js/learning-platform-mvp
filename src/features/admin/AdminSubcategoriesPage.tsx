import { useState } from 'react'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useDocTitle } from '../../lib/useDocTitle'
import { useAdminOverview, useDeleteSubcategory, useSaveSubcategory, type AdminSubcategory } from '../../data/admin'

const PAGE_SIZE = 20

export default function AdminSubcategoriesPage() {
  useDocTitle('Subcategories — Primer Admin')
  const overview = useAdminOverview()
  const save = useSaveSubcategory()
  const remove = useDeleteSubcategory()
  const [parent, setParent] = useState('all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<AdminSubcategory | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminSubcategory | null>(null)

  if (overview.isPending) return <PageLoading />
  if (overview.isError) return <PageError onRetry={() => void overview.refetch()} />

  const { categories, subcategories, topics } = overview.data
  const filtered = subcategories.filter((s) => parent === 'all' || String(s.category_id) === parent)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const editSub = editing !== null && editing !== 'new' ? editing : null

  const catName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—'
  const topicCount = (subId: number) => topics.filter((t) => t.subcategory_id === subId).length

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const categoryId = Number(form.get('category_id'))
    save.mutate(
      {
        id: editSub?.id,
        name: String(form.get('name') ?? '').trim(),
        categoryId,
        description: String(form.get('description') ?? '').trim(),
        sortOrder: subcategories.filter((s) => s.category_id === categoryId).length + 1,
      },
      { onSuccess: () => setEditing(null) },
    )
  }

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
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
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
            {visible.map((s) => (
              <tr key={s.id}>
                <td>
                  <span className="td-title">{s.name}</span>
                </td>
                <td>{catName(s.category_id)}</td>
                <td className="mono">{topicCount(s.id)}</td>
                <td>
                  <div className="td-actions">
                    <button className="btn-icon" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </button>
                    <button className="btn-icon danger" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
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
            <button key={p} className={p === safePage ? 'page-btn active' : 'page-btn'} aria-current={p === safePage ? 'page' : undefined} onClick={() => setPage(p)}>
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
        <form onSubmit={onSave}>
          <div className="flex center between">
            <h2 id="sub-modal-title" style={{ fontSize: 19 }}>
              {editing === 'new' ? 'Add subcategory' : 'Edit subcategory'}
            </h2>
            <button className="btn-icon" type="button" onClick={() => setEditing(null)} aria-label="Close">
              <Icon name="x" className="icon-sm icon" />
            </button>
          </div>
          <div className="flex col gap-4" style={{ marginTop: 20 }}>
            <div className="field">
              <label className="label" htmlFor="sub-name">
                Name
              </label>
              <input key={editSub?.id ?? 'new'} className="input" id="sub-name" name="name" required defaultValue={editSub?.name ?? ''} />
            </div>
            <div className="field">
              <label className="label" htmlFor="sub-parent">
                Parent category
              </label>
              <select key={editSub?.id ?? 'new'} className="select" id="sub-parent" name="category_id" defaultValue={String(editSub?.category_id ?? categories[0]?.id ?? '')}>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="sub-desc">
                Description
              </label>
              <textarea key={editSub?.id ?? 'new'} className="textarea" id="sub-desc" name="description" rows={2} defaultValue={editSub?.description ?? ''}></textarea>
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
            disabled={remove.isPending}
            onClick={() => {
              if (deleting) remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
            }}
          >
            {remove.isPending ? 'Deleting…' : 'Delete subcategory'}
          </button>
        </div>
      </Modal>
    </>
  )
}
