import { useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { topicHref } from '../../lib/routes'
import { CATEGORIES, findTopic, lessonsFor } from '../../data/mock'
import NotFoundPage from '../catalog/NotFoundPage'

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function TopicEditorPage() {
  const { topicSlug } = useParams()
  const isNew = !topicSlug
  const navigate = useNavigate()
  const toast = useToast()
  const found = topicSlug ? findTopic(topicSlug) : null

  useDocTitle('Topic editor — Primer Admin')

  const [selectedLesson, setSelectedLesson] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [catSlug, setCatSlug] = useState(found?.cat.slug ?? CATEGORIES[0].slug)
  const [subSlug, setSubSlug] = useState(found?.sub.slug ?? CATEGORIES[0].subs[0].slug)

  if (topicSlug && !found) return <NotFoundPage />

  const topic = found?.topic ?? null
  const units = topic ? lessonsFor(topic) : []
  const flat = units.flatMap((u, ui) => u.items.map((l) => ({ ...l, unit: u.unit, unitIndex: ui })))
  const current = flat[selectedLesson]
  const cat = CATEGORIES.find((c) => c.slug === catSlug) ?? CATEGORIES[0]

  const onCatChange = (slug: string) => {
    setCatSlug(slug)
    const nextCat = CATEGORIES.find((c) => c.slug === slug)
    /* Dependent select: category change resets the subcategory to the first child. */
    setSubSlug(nextCat?.subs[0]?.slug ?? '')
  }

  const rowKeyDown = (e: KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedLesson(idx)
    }
  }

  let flatIdx = -1
  return (
    <>
      <Link className="small w-600" to="/admin/topics" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Icon name="arrow-left" className="icon-sm icon" />
        Back to topics
      </Link>

      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>{isNew ? 'New topic' : `Edit topic: ${topic?.name}`}</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            {isNew ? "Draft a new topic, add its lessons, then publish when it's ready." : 'Changes are drafts until you publish them.'}
          </p>
        </div>
        <div className="flex gap-2 wrap">
          {!isNew && topic ? (
            <Link className="btn btn-secondary" to={topicHref(topic.slug)}>
              <Icon name="eye" className="icon-sm icon" />
              Preview
            </Link>
          ) : null}
          <button className="btn btn-secondary" onClick={() => toast('Draft saved')}>
            Save draft
          </button>
          <button className="btn btn-primary" onClick={() => toast('Topic published — live for learners')}>
            Publish
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main column */}
        <div className="flex col gap-4">
          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>Topic details</h2>
            <div className="flex col gap-4" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="ed-name">
                  Title
                </label>
                <input className="input" id="ed-name" defaultValue={topic?.name ?? ''} />
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-desc">
                  Description
                </label>
                <textarea className="textarea" id="ed-desc" rows={2} defaultValue={topic?.desc ?? ''}></textarea>
                <p className="hint">Shown on topic cards and the topic page header.</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="flex center between" style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <h2 style={{ fontSize: 16 }}>Lessons</h2>
                <p className="hint" style={{ marginTop: 2 }}>
                  Select a lesson to edit its content below. Learners see them in this order.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => toast('Lesson added to the end of the list')}>
                <Icon name="plus" className="icon-sm icon" />
                Add lesson
              </button>
            </div>
            <div className="ed-lesson-list">
              {flat.length === 0 ? (
                <div className="empty" style={{ padding: 26 }}>
                  <p className="small muted">No lessons yet. Add the first one below.</p>
                </div>
              ) : (
                units.map((u, ui) => (
                  <div key={ui}>
                    <div className="unit-head" style={ui === 0 ? { borderTop: 'none' } : undefined}>
                      <span className="unit-num">UNIT {ui < 9 ? '0' : ''}{ui + 1}</span>
                      <span className="unit-title">{u.unit}</span>
                    </div>
                    {u.items.map((l) => {
                      flatIdx++
                      const idx = flatIdx
                      return (
                        <div
                          key={idx}
                          className={idx === selectedLesson ? 'lesson-row now' : 'lesson-row'}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedLesson(idx)}
                          onKeyDown={(e) => rowKeyDown(e, idx)}
                        >
                          <span className="lr-state" aria-hidden="true">
                            <span className="mono">{idx + 1 < 10 ? '0' : ''}{idx + 1}</span>
                          </span>
                          <span className="lr-title">{l.title}</span>
                          <span className="lr-time">{l.mins}m</span>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>{current ? `Editing lesson: ${current.title}` : 'Lesson content'}</h2>
            <div className="flex col gap-4" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="ed-lesson-body">
                  Lesson content
                </label>
                <textarea
                  key={selectedLesson}
                  className="textarea"
                  id="ed-lesson-body"
                  rows={10}
                  defaultValue={current ? `Sample body for “${current.title}”. In the real editor this loads the stored lesson content.` : ''}
                ></textarea>
                <p className="hint">Supports markdown formatting. This is the article learners read on the lesson page.</p>
              </div>
              <div className="field" style={{ maxWidth: 200 }}>
                <label className="label" htmlFor="ed-lesson-mins">
                  Estimated minutes
                </label>
                <input key={selectedLesson} className="input mono" id="ed-lesson-mins" type="number" defaultValue={current?.mins ?? ''} />
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <aside className="flex col gap-4">
          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>Publish</h2>
            <label className="flex center between" style={{ cursor: 'pointer', gap: 14, marginTop: 14 }}>
              <span>
                <span className="small w-600 ink" style={{ display: 'block' }}>
                  Published
                </span>
                <span className="hint">Visible to learners immediately.</span>
              </span>
              <span className="switch">
                <input type="checkbox" id="ed-status" defaultChecked={!isNew} />
                <span className="track"></span>
              </span>
            </label>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>Placement</h2>
            <div className="flex col gap-4" style={{ marginTop: 14 }}>
              <div className="field">
                <label className="label" htmlFor="ed-cat">
                  Category
                </label>
                <select className="select" id="ed-cat" value={catSlug} onChange={(e) => onCatChange(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-subcat">
                  Subcategory
                </label>
                <select className="select" id="ed-subcat" value={subSlug} onChange={(e) => setSubSlug(e.target.value)}>
                  {cat.subs.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-level">
                  Difficulty
                </label>
                <select className="select" id="ed-level" defaultValue={topic?.level ?? 'beginner'}>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card card-pad" style={{ borderColor: '#EED4D0' }}>
            <h2 style={{ fontSize: 16, color: 'var(--red)' }}>Danger zone</h2>
            <p className="hint" style={{ marginTop: 6 }}>
              Deleting removes the topic and its lessons for every learner.
            </p>
            <button className="btn btn-danger btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => setDeleteOpen(true)}>
              Delete this topic
            </button>
          </div>
        </aside>
      </div>

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} labelledBy="edel-modal-title">
        <div className="modal-icon">
          <Icon name="trash" />
        </div>
        <h2 id="edel-modal-title" style={{ fontSize: 19 }}>
          Delete this topic?
        </h2>
        <p className="small" style={{ marginTop: 8 }}>
          This permanently removes the topic and all of its lesson content. Learner progress tied to it is also cleared. This can't be undone.
        </p>
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary btn-block" onClick={() => setDeleteOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              setDeleteOpen(false)
              toast('Topic deleted')
              navigate('/admin/topics')
            }}
          >
            Delete topic
          </button>
        </div>
      </Modal>
    </>
  )
}
