import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import Icon from '../icons/Icon'
import Dropdown from '../ui/Dropdown'

const LINKS = [
  { to: '/admin', end: true, icon: 'grid', label: 'Dashboard' },
  { to: '/admin/categories', end: false, icon: 'folder', label: 'Categories' },
  { to: '/admin/subcategories', end: false, icon: 'layers', label: 'Subcategories' },
  { to: '/admin/topics', end: false, icon: 'file-text', label: 'Topics' },
]

function sideLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'side-link active' : 'side-link'
}

function drawerLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'drawer-link active' : 'drawer-link'
}

/* Admin shell — port of adminShellHTML (sidebar + topbar + mobile drawer).
   The topic editor lives under /admin/topics/*, so NavLink keeps the
   Topics item active there (same as the prototype's activeMap). */
export default function AdminLayout() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => setDrawerOpen(false), [location])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <Link className="logo" to="/admin">
          <span className="logo-mark" aria-hidden="true"></span>Primer <span className="admin-tag">ADMIN</span>
        </Link>
        <nav className="flex col" style={{ gap: 2 }} aria-label="Admin">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={sideLinkClass}>
              <Icon name={l.icon} className="icon-sm icon" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-note">Changes publish to the live site. Drafts stay hidden from learners until you publish them.</div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="flex center gap-3">
            <button className="btn-icon menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Icon name="menu" />
            </button>
            <Link className="small w-600" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View site <Icon name="external-link" className="icon-sm icon" />
            </Link>
          </div>
          <Dropdown
            trigger={
              <>
                <span className="avatar" aria-hidden="true">
                  JC
                </span>
                Jay <Icon name="chevron-down" className="icon-sm icon" />
              </>
            }
          >
            <Link className="dropdown-item" to="/">
              <Icon name="external-link" className="icon-sm icon" />
              View site
            </Link>
            <div className="dropdown-rule"></div>
            <Link className="dropdown-item" to="/admin/login">
              <Icon name="log-out" className="icon-sm icon" />
              Sign out
            </Link>
          </Dropdown>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={drawerOpen ? 'drawer open' : 'drawer'} id="drawer">
        <div className="drawer-scrim" onClick={() => setDrawerOpen(false)}></div>
        <div className="drawer-panel" role="dialog" aria-label="Admin menu">
          <div className="drawer-head">
            <b className="ink">Primer Admin</b>
            <button className="btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <Icon name="x" />
            </button>
          </div>
          <nav className="flex col">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={drawerLinkClass}>
                <Icon name={l.icon} />
                {l.label}
              </NavLink>
            ))}
            <div className="drawer-rule"></div>
            <Link className="drawer-link" to="/">
              <Icon name="external-link" />
              View site
            </Link>
            <Link className="drawer-link" to="/admin/login">
              <Icon name="log-out" />
              Sign out
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
