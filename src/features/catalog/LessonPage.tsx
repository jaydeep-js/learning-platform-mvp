import { Link, Navigate, useParams } from 'react-router'
import Icon from '../../components/icons/Icon'
import Crumbs from '../../components/layout/Crumbs'
import NotFoundPage from './NotFoundPage'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { catHref, lessonHref, subHref, topicHref } from '../../lib/routes'
import { findTopic, flatLessons, progressOf } from '../../data/mock'

export default function LessonPage() {
  const { topicSlug = '', n: nParam = '' } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const found = findTopic(topicSlug)
  const flat = found ? flatLessons(found.topic) : []
  const n = parseInt(nParam, 10)
  const cur = found && n >= 1 && n <= flat.length ? flat[n - 1] : null
  useDocTitle(found && cur ? `${cur.title} — ${found.topic.name} — Primer` : 'Primer')

  if (!found) return <NotFoundPage />
  /* Out-of-range or non-numeric lesson number → first lesson. */
  if (!cur) return <Navigate to={lessonHref(topicSlug, 1)} replace />

  const { cat, sub, topic: t } = found
  const pct = progressOf(t.slug)
  const doneCount = Math.floor((flat.length * pct) / 100)
  const isLast = n >= flat.length

  return (
    <main>
      <div className="container page-head" style={{ paddingBottom: 0 }}>
        <Crumbs
          items={[
            { label: 'Home', href: '/' },
            { label: cat.name, href: catHref(cat.slug) },
            { label: sub.name, href: subHref(cat.slug, sub.slug) },
            { label: t.name, href: topicHref(t.slug) },
            { label: `Lesson ${n}` },
          ]}
        />
      </div>

      <div className="container section-tight">
        <div className="reader-layout">
          <aside className="reader-side">
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="reader-progress">
                <Link className="small w-600" to={topicHref(t.slug)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Icon name="arrow-left" className="icon-sm icon" />
                  Back to topic
                </Link>
                <div className="flex between center small" style={{ marginBottom: 8 }}>
                  <span className="mono muted">
                    Lesson {n} of {flat.length}
                  </span>
                  <span className="mono muted">{cur.mins} min</span>
                </div>
                <div className="progress" aria-hidden="true">
                  <span style={{ width: `${Math.round((n / flat.length) * 100)}%` }}></span>
                </div>
              </div>
              <nav aria-label="Lessons in this topic" style={{ padding: 8 }}>
                {flat.map((l, i) => {
                  const idx = i + 1
                  const state = idx === n ? 'now' : user && idx <= doneCount ? 'done' : ''
                  return (
                    <Link
                      key={idx}
                      className={`lesson-row ${state}`}
                      to={lessonHref(t.slug, idx)}
                      aria-current={idx === n ? 'page' : undefined}
                    >
                      <span className="lr-state" aria-hidden="true">
                        {state === 'done' ? (
                          <Icon name="check" className="icon-sm icon" />
                        ) : state === 'now' ? (
                          <Icon name="play" className="icon-sm icon" />
                        ) : (
                          <span className="mono">{idx < 10 ? '0' : ''}{idx}</span>
                        )}
                      </span>
                      <span className="lr-title">{l.title}</span>
                      <span className="lr-time">{l.mins}m</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          <article>
            <div className="reader-topbar">
              <div>
                <p className="eyebrow">
                  {t.name} · {cur.unit}
                </p>
                <h1 style={{ fontSize: 30, marginTop: 8 }}>{cur.title}</h1>
              </div>
              <div className="flex center gap-2">
                {user ? (
                  <>
                    <button className="btn btn-hi auth-user-only" onClick={() => toast('Lesson marked complete')}>
                      <Icon name="check" className="icon-sm icon" />
                      Mark complete
                    </button>
                    <button
                      className="btn-icon auth-user-only"
                      aria-pressed="false"
                      aria-label="Bookmark this lesson"
                      onClick={() => toast('Saved to your bookmarks')}
                    >
                      <Icon name="bookmark" className="icon-sm icon" />
                    </button>
                  </>
                ) : (
                  <Link className="btn btn-secondary btn-sm auth-guest-only" to="/auth">
                    <Icon name="log-in" className="icon-sm icon" />
                    Sign in to save progress
                  </Link>
                )}
              </div>
            </div>

            {/* Sample article body — replaced with stored markdown (body_md) in M2. */}
            <div className="prose">
              <div className="callout">
                <b>Before you start:</b> keep a console open and run every example yourself — the point of each lesson is the practice, not the reading.
              </div>

              <p>
                Every lesson on Primer follows the same rhythm: a short explanation of the idea, a worked example you can follow along with, and a small exercise to prove it stuck. This one is no different.
              </p>

              <h2>The idea</h2>
              <p>
                Programs are just instructions executed in order. Before worrying about syntax, get comfortable with the shape of the workflow: write a small piece of code, run it, read what happens, adjust. That loop — <em>write, run, read, adjust</em> — is the actual skill. The language details attach themselves to it with practice.
              </p>
              <p>Open your browser's console and type:</p>
              <pre>
                <code>{`console.log("Hello from Primer!");

let lessonsFinished = 2;
console.log("Lessons finished: " + lessonsFinished);`}</code>
              </pre>
              <p>
                Two things just happened. You told the machine to print a message, and it did — immediately, with no build step and nothing to install. This tight feedback loop is why we start in the console.
              </p>

              <h2>Try it yourself</h2>
              <ul>
                <li>Change the message inside the quotes and run it again.</li>
                <li>
                  Make <code>lessonsFinished</code> a bigger number. What prints now?
                </li>
                <li>Remove the quotes around the message and read the error. Errors are information, not judgment.</li>
              </ul>

              <h2>What to remember</h2>
              <ol>
                <li>Code runs top to bottom, one instruction at a time.</li>
                <li>The console is the fastest place to test an idea.</li>
                <li>Reading errors calmly is half the job.</li>
              </ol>
              <p>When the exercise above feels comfortable, mark this lesson complete and move on — the next one builds directly on it.</p>
            </div>

            <div className="reader-footnav">
              {n > 1 ? (
                <Link className="footnav-btn" to={lessonHref(t.slug, n - 1)}>
                  <span className="footnav-kind">← Previous</span>
                  <span className="footnav-title">{flat[n - 2].title}</span>
                </Link>
              ) : null}
              <Link className="footnav-btn next" to={isLast ? topicHref(t.slug) : lessonHref(t.slug, n + 1)}>
                <span className="footnav-kind">{isLast ? 'Finish' : 'Next'} →</span>
                <span className="footnav-title">{isLast ? `Back to ${t.name}` : flat[n].title}</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
