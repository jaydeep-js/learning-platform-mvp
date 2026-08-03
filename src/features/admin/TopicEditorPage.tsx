import { useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Modal from '../../components/ui/Modal'
import { PageError, PageLoading } from '../../components/ui/LoadState'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { topicHref } from '../../lib/routes'
import NotFoundPage from '../catalog/NotFoundPage'
import {
  useAddLesson,
  useAdminOverview,
  useDeleteTopic,
  useEditorTopic,
  useSaveLesson,
  useSaveTopic,
  type AdminCategory,
  type AdminSubcategory,
  type EditorTopic,
} from '../../data/admin'
import type { TopicLevel } from '../../lib/database.types'

const LEVELS: { value: TopicLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function TopicEditorPage() {
  const { topicSlug } = useParams()
  const isNew = !topicSlug
  const overview = useAdminOverview()
  const editor = useEditorTopic(topicSlug)

  useDocTitle('Topic editor — Primer Admin')

  if (overview.isPending || (!isNew && editor.isPending)) return <PageLoading />
  if (overview.isError || editor.isError) return <PageError onRetry={() => void overview.refetch()} />
  if (!isNew && !editor.data) return <NotFoundPage />

  return (
    <EditorForm
      key={editor.data?.id ?? 'new'}
      topic={editor.data ?? null}
      categories={overview.data.categories}
      subcategories={overview.data.subcategories}
    />
  )
}

function EditorForm({
  topic,
  categories,
  subcategories,
}: {
  topic: EditorTopic | null
  categories: AdminCategory[]
  subcategories: AdminSubcategory[]
}) {
  const isNew = topic === null
  const navigate = useNavigate()
  const toast = useToast()
  const saveTopic = useSaveTopic()
  const saveLesson = useSaveLesson()
  const addLesson = useAddLesson()
  const deleteTopic = useDeleteTopic()

  const initialSub = subcategories.find((s) => s.id === topic?.subcategory_id)
  const [title, setTitle] = useState(topic?.title ?? '')
  const [description, setDescription] = useState(topic?.description ?? '')
  const [level, setLevel] = useState<TopicLevel>(topic?.level ?? 'beginner')
  const [catId, setCatId] = useState<number>(initialSub?.category_id ?? categories[0]?.id ?? 0)
  const [subId, setSubId] = useState<number>(topic?.subcategory_id ?? subcategories.find((s) => s.category_id === (categories[0]?.id ?? 0))?.id ?? 0)
  const [published, setPublished] = useState(topic?.status === 'published')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const lessons = topic?.lessons ?? []
  const units = topic?.units ?? []
  const [selectedId, setSelectedId] = useState<number | null>(lessons[0]?.id ?? null)
  const selected = lessons.find((l) => l.id === selectedId) ?? null
  const [lessonBody, setLessonBody] = useState(selected?.body_md ?? '')
  const [lessonMins, setLessonMins] = useState(selected?.minutes ?? 5)

  const catSubs = subcategories.filter((s) => s.category_id === catId)

  const onCatChange = (id: number) => {
    setCatId(id)
    /* Dependent select: switching category resets the subcategory. */
    setSubId(subcategories.find((s) => s.category_id === id)?.id ?? 0)
  }

  const selectLesson = (id: number) => {
    /* Save the outgoing lesson's edits before switching. */
    flushLessonEdits()
    const next = lessons.find((l) => l.id === id)
    setSelectedId(id)
    setLessonBody(next?.body_md ?? '')
    setLessonMins(next?.minutes ?? 5)
  }

  const lessonDirty = selected !== null && (lessonBody !== selected.body_md || lessonMins !== selected.minutes)

  const flushLessonEdits = () => {
    if (selected && lessonDirty) {
      saveLesson.mutate({ id: selected.id, title: selected.title, bodyMd: lessonBody, minutes: lessonMins })
    }
  }

  /* Publish switch mapping (approved): ON → published; OFF → draft, except a
     topic currently "in review" stays in review until explicitly published. */
  const statusFor = (pub: boolean) => (pub ? 'published' : topic?.status === 'review' ? 'review' : 'draft')

  const onSave = (pub: boolean) => {
    if (!title.trim()) {
      toast('Give the topic a title first')
      return
    }
    if (!subId) {
      toast('Pick a subcategory in Placement first')
      return
    }
    setPublished(pub)
    flushLessonEdits()
    saveTopic.mutate(
      { id: topic?.id, title: title.trim(), description: description.trim(), level, subcategoryId: subId, status: statusFor(pub) },
      {
        onSuccess: (slug) => {
          toast(pub ? 'Topic published — live for learners' : 'Draft saved')
          if (isNew) navigate(`/admin/topics/${slug}/edit`)
        },
        onError: (e) => toast(e instanceof Error ? e.message : "Couldn't save the topic"),
      },
    )
  }

  const rowKeyDown = (e: KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectLesson(id)
    }
  }

  /* Lessons grouped under unit headers, flat-rendered like the prototype. */
  let flatIdx = 0

  return (
    <>
      <Link className="small w-600" to="/admin/topics" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Icon name="arrow-left" className="icon-sm icon" />
        Back to topics
      </Link>

      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>{isNew ? 'New topic' : `Edit topic: ${topic.title}`}</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            {isNew ? "Draft a new topic, add its lessons, then publish when it's ready." : 'Changes are drafts until you publish them.'}
          </p>
        </div>
        <div className="flex gap-2 wrap">
          {!isNew ? (
            <Link className="btn btn-secondary" to={topicHref(topic.slug)}>
              <Icon name="eye" className="icon-sm icon" />
              Preview
            </Link>
          ) : null}
          <button className="btn btn-secondary" disabled={saveTopic.isPending} onClick={() => onSave(false)}>
            Save draft
          </button>
          <button className="btn btn-primary" disabled={saveTopic.isPending} onClick={() => onSave(true)}>
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
                <input className="input" id="ed-name" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-desc">
                  Description
                </label>
                <textarea className="textarea" id="ed-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
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
              <button
                className="btn btn-secondary btn-sm"
                disabled={addLesson.isPending}
                onClick={() => {
                  if (isNew) {
                    toast('Save the topic first, then add lessons')
                    return
                  }
                  addLesson.mutate({ topicId: topic.id, units, lessons })
                }}
              >
                <Icon name="plus" className="icon-sm icon" />
                Add lesson
              </button>
            </div>
            <div className="ed-lesson-list">
              {lessons.length === 0 ? (
                <div className="empty" style={{ padding: 26 }}>
                  <p className="small muted">{isNew ? 'No lessons yet. Save the topic, then add the first one.' : 'No lessons yet. Add the first one above.'}</p>
                </div>
              ) : (
                units.map((u, ui) => {
                  const unitLessons = lessons.filter((l) => l.unit_id === u.id)
                  if (unitLessons.length === 0) return null
                  return (
                    <div key={u.id}>
                      <div className="unit-head" style={ui === 0 ? { borderTop: 'none' } : undefined}>
                        <span className="unit-num">UNIT {ui < 9 ? '0' : ''}{ui + 1}</span>
                        <span className="unit-title">{u.title}</span>
                      </div>
                      {unitLessons.map((l) => {
                        flatIdx++
                        const idx = flatIdx
                        return (
                          <div
                            key={l.id}
                            className={l.id === selectedId ? 'lesson-row now' : 'lesson-row'}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectLesson(l.id)}
                            onKeyDown={(e) => rowKeyDown(e, l.id)}
                          >
                            <span className="lr-state" aria-hidden="true">
                              <span className="mono">{idx < 10 ? '0' : ''}{idx}</span>
                            </span>
                            <span className="lr-title">{l.title}</span>
                            <span className="lr-time">{l.id === selectedId ? lessonMins : l.minutes}m</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>{selected ? `Editing lesson: ${selected.title}` : 'Lesson content'}</h2>
            <div className="flex col gap-4" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="ed-lesson-body">
                  Lesson content
                </label>
                <textarea
                  className="textarea"
                  id="ed-lesson-body"
                  rows={10}
                  value={lessonBody}
                  disabled={!selected}
                  onChange={(e) => setLessonBody(e.target.value)}
                ></textarea>
                <p className="hint">Supports markdown formatting. This is the article learners read on the lesson page.</p>
              </div>
              <div className="flex center gap-4 wrap">
                <div className="field" style={{ maxWidth: 200 }}>
                  <label className="label" htmlFor="ed-lesson-mins">
                    Estimated minutes
                  </label>
                  <input
                    className="input mono"
                    id="ed-lesson-mins"
                    type="number"
                    min={1}
                    value={lessonMins}
                    disabled={!selected}
                    onChange={(e) => setLessonMins(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>
                {lessonDirty ? <span className="small muted">Unsaved lesson changes — saved with the topic.</span> : null}
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
                <input type="checkbox" id="ed-status" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span className="track"></span>
              </span>
            </label>
            {topic?.status === 'review' && !published ? <p className="hint" style={{ marginTop: 8 }}>Currently in review — saving keeps it in review until published.</p> : null}
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 16 }}>Placement</h2>
            <div className="flex col gap-4" style={{ marginTop: 14 }}>
              <div className="field">
                <label className="label" htmlFor="ed-cat">
                  Category
                </label>
                <select className="select" id="ed-cat" value={String(catId)} onChange={(e) => onCatChange(Number(e.target.value))}>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-subcat">
                  Subcategory
                </label>
                <select className="select" id="ed-subcat" value={String(subId)} onChange={(e) => setSubId(Number(e.target.value))}>
                  {catSubs.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="ed-level">
                  Difficulty
                </label>
                <select className="select" id="ed-level" value={level} onChange={(e) => setLevel(e.target.value as TopicLevel)}>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isNew ? (
            <div className="card card-pad" style={{ borderColor: '#EED4D0' }}>
              <h2 style={{ fontSize: 16, color: 'var(--red)' }}>Danger zone</h2>
              <p className="hint" style={{ marginTop: 6 }}>
                Deleting removes the topic and its lessons for every learner.
              </p>
              <button className="btn btn-danger btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => setDeleteOpen(true)}>
                Delete this topic
              </button>
            </div>
          ) : null}
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
            disabled={deleteTopic.isPending}
            onClick={() => {
              if (topic) {
                deleteTopic.mutate(topic.id, {
                  onSuccess: () => {
                    setDeleteOpen(false)
                    navigate('/admin/topics')
                  },
                })
              }
            }}
          >
            {deleteTopic.isPending ? 'Deleting…' : 'Delete topic'}
          </button>
        </div>
      </Modal>
    </>
  )
}
