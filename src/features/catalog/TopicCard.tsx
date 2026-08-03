import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import LevelBadge from '../../components/ui/LevelBadge'
import { useAuth } from '../auth/AuthProvider'
import { useBookmarks, useProgress, useToggleBookmark } from '../../data/learning'
import { fmtMins } from '../../lib/format'
import { subHref, topicHref } from '../../lib/routes'
import type { TopicContext } from '../../data/mock'

/* The single reusable topic card (port of topicCardHTML in app.js).
   Member and guest footers render conditionally from the session; progress
   and bookmarks come from the member's real rows. */
export default function TopicCard({ ctx }: { ctx: TopicContext }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  const { bookmarks } = useBookmarks()
  const toggleBookmark = useToggleBookmark()
  const { cat, sub, topic: t } = ctx
  const pct = progress.pctOf(t.id, t.lessons)
  const marked = t.id !== undefined && bookmarks.has(t.id)
  const href = topicHref(t.slug)

  return (
    <article className="card card-hover topic-card" data-level={t.level} data-mins={t.mins} data-name={t.name.toLowerCase()}>
      <div className="t-top">
        <Link className="tag" to={subHref(cat.slug, sub.slug)}>
          {sub.name}
        </Link>
        {user && t.id !== undefined ? (
          <button
            className={marked ? 'btn-icon auth-user-only is-active' : 'btn-icon auth-user-only'}
            onClick={() => toggleBookmark.mutate({ topicId: t.id!, on: !marked })}
            aria-pressed={marked}
            aria-label={`Bookmark ${t.name}`}
            style={{ width: 32, height: 32 }}
          >
            <Icon name={marked ? 'bookmark-fill' : 'bookmark'} className="icon-sm icon" />
          </button>
        ) : null}
      </div>
      <h3>
        <Link to={href}>{t.name}</Link>
      </h3>
      <p className="t-desc">{t.desc}</p>
      <div className="t-meta">
        <LevelBadge level={t.level} />
        <span className="tag">
          <Icon name="clock" className="icon-sm icon" />
          <span className="mono">{fmtMins(t.mins)}</span>
        </span>
        <span className="tag mono">{t.lessons} lessons</span>
      </div>
      {user ? (
        <div className="auth-user-only">
          {pct >= 100 ? (
            <>
              <div className="progress is-done" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.name} progress`}>
                <span style={{ width: '100%' }}></span>
              </div>
              <div className="t-foot">
                <span className="small" style={{ color: 'var(--green)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="check-circle" className="icon-sm icon" />
                  Completed
                </span>
                <Link className="t-cta" to={href}>
                  Review <Icon name="arrow-right" className="icon-sm icon" />
                </Link>
              </div>
            </>
          ) : pct > 0 ? (
            <>
              <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.name} progress`}>
                <span style={{ width: `${pct}%` }}></span>
              </div>
              <div className="t-foot">
                <span className="small muted mono">{pct}% done</span>
                <Link className="t-cta" to={href}>
                  Continue <Icon name="arrow-right" className="icon-sm icon" />
                </Link>
              </div>
            </>
          ) : (
            <div className="t-foot">
              <span className="small muted">Not started</span>
              <Link className="t-cta" to={href}>
                Start <Icon name="arrow-right" className="icon-sm icon" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-guest-only">
          <div className="t-foot">
            <span className="small muted">{t.lessons} lessons</span>
            <Link className="t-cta" to={href}>
              Start <Icon name="arrow-right" className="icon-sm icon" />
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
