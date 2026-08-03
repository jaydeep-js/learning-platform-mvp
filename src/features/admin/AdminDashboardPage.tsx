import { Link } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useDocTitle } from '../../lib/useDocTitle'

/* M0: table rows and stats are mock content matching the prototype —
   wired to real aggregate queries in M4. */
const RECENT_TOPICS = [
  { name: 'Machine Learning Basics', category: 'AI & Machine Learning', status: 'draft', label: 'Draft', updated: 'Aug 1, 2026' },
  { name: 'Public Speaking Essentials', category: 'Personal Growth', status: 'review', label: 'In review', updated: 'Jul 30, 2026' },
  { name: 'JavaScript Basics', category: 'Programming', status: 'published', label: 'Published', updated: 'Jul 29, 2026' },
  { name: 'Introduction to HTML', category: 'Programming', status: 'published', label: 'Published', updated: 'Jul 28, 2026' },
]

export default function AdminDashboardPage() {
  useDocTitle('Admin dashboard — Primer')
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 style={{ fontSize: 24 }}>Dashboard</h1>
          <p className="small muted" style={{ marginTop: 4 }}>
            Overview of your content and publishing pipeline.
          </p>
        </div>
        <div className="flex gap-2 wrap">
          <Link className="btn btn-secondary" to="/admin/topics">
            Manage topics
          </Link>
          <Link className="btn btn-primary" to="/admin/topics/new">
            <Icon name="plus" className="icon-sm icon" />
            New topic
          </Link>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-top">
            <span>Total topics</span>
            <Icon name="file-text" className="icon-sm icon" />
          </div>
          <b>128</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Published</span>
            <svg className="icon-sm icon" style={{ color: 'var(--green)' }} aria-hidden="true">
              <use href="#i-check-circle" />
            </svg>
          </div>
          <b>96</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Drafts</span>
            <svg className="icon-sm icon" style={{ color: 'var(--amber)' }} aria-hidden="true">
              <use href="#i-edit" />
            </svg>
          </div>
          <b>24</b>
        </div>
        <div className="card stat-card">
          <div className="stat-top">
            <span>Categories</span>
            <Icon name="folder" className="icon-sm icon" />
          </div>
          <b>8</b>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <div className="sh-text">
          <h2 style={{ fontSize: 18 }}>Recently updated topics</h2>
        </div>
        <Link className="section-link" to="/admin/topics">
          View all topics <Icon name="arrow-right" className="icon-sm icon" />
        </Link>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Category</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TOPICS.map((t) => (
              <tr key={t.name}>
                <td>
                  <span className="td-title">{t.name}</span>
                </td>
                <td>{t.category}</td>
                <td>
                  <span className={`pill pill-${t.status}`}>{t.label}</span>
                </td>
                <td className="mono">{t.updated}</td>
                <td>
                  <div className="td-actions">
                    <Link className="btn-icon" to="/admin/topics/javascript-basics/edit" aria-label={`Edit ${t.name}`}>
                      <Icon name="edit" className="icon-sm icon" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card card-pad">
          <h2 style={{ fontSize: 16 }}>Content by category</h2>
          <ul className="flex col" style={{ gap: 12, marginTop: 16 }}>
            <li className="flex center between small">
              <span>Programming</span>
              <b className="mono ink">21 topics</b>
            </li>
            <li className="flex center between small">
              <span>Design</span>
              <b className="mono ink">16 topics</b>
            </li>
            <li className="flex center between small">
              <span>Business</span>
              <b className="mono ink">16 topics</b>
            </li>
            <li className="flex center between small">
              <span>Marketing</span>
              <b className="mono ink">16 topics</b>
            </li>
            <li className="flex center between small">
              <span>Everything else</span>
              <b className="mono ink">59 topics</b>
            </li>
          </ul>
        </div>
        <div className="card card-pad">
          <h2 style={{ fontSize: 16 }}>Publishing queue</h2>
          <p className="small muted" style={{ marginTop: 6 }}>
            Drafts waiting on review before they go live.
          </p>
          <ul className="flex col" style={{ gap: 12, marginTop: 16 }}>
            <li className="flex center between small">
              <span>Machine Learning Basics</span>
              <span className="pill pill-draft">Draft</span>
            </li>
            <li className="flex center between small">
              <span>Public Speaking Essentials</span>
              <span className="pill pill-review">In review</span>
            </li>
            <li className="flex center between small">
              <span>Graphic Design Principles</span>
              <span className="pill pill-draft">Draft</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
