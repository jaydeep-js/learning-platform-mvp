import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Icon from '../icons/Icon'
import Dropdown from '../ui/Dropdown'
import { useAuth } from '../../features/auth/AuthProvider'
import { searchHref } from '../../lib/routes'

function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark" aria-hidden="true"></span>Primer
    </Link>
  )
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : ''
}

function drawerLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'drawer-link active' : 'drawer-link'
}

/* Learner shell — port of appHeaderHTML / appDrawerHTML / appFooterHTML. */
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')
    navigate(searchHref(typeof q === 'string' ? q.trim() : ''))
  }

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Logo />
          <nav className="main-nav" aria-label="Main">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/categories" className={navClass}>
              Categories
            </NavLink>
            {user ? (
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
            ) : null}
          </nav>
          <form className="header-search input-wrap" role="search" onSubmit={onSearch}>
            <Icon name="search" />
            <label className="visually-hidden" htmlFor="hdr-q">
              Search topics
            </label>
            <input className="input" type="search" id="hdr-q" name="q" placeholder="Search topics…" autoComplete="off" />
          </form>
          <div className="header-cluster">
            {user ? (
              <Dropdown
                className="auth-user-only"
                trigger={
                  <>
                    <span className="avatar" aria-hidden="true">
                      {user.initials}
                    </span>
                    {user.name.split(' ')[0]} <Icon name="chevron-down" className="icon-sm icon" />
                  </>
                }
              >
                <Link className="dropdown-item" to="/dashboard">
                  <Icon name="grid" className="icon-sm icon" />
                  Dashboard
                </Link>
                <Link className="dropdown-item" to="/profile">
                  <Icon name="user" className="icon-sm icon" />
                  Profile & settings
                </Link>
                <div className="dropdown-rule"></div>
                <Link
                  className="dropdown-item"
                  to="/"
                  onClick={() => {
                    logout()
                  }}
                >
                  <Icon name="log-out" className="icon-sm icon" />
                  Sign out
                </Link>
              </Dropdown>
            ) : (
              <>
                <Link to="/auth" className="btn btn-ghost btn-sm auth-guest-only">
                  Log in
                </Link>
                <Link to="/auth" className="btn btn-primary btn-sm auth-guest-only">
                  Get started
                </Link>
              </>
            )}
            <button className="btn-icon menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="container">
          <div className="foot-grid">
            <div>
              <Logo />
              <p className="small" style={{ maxWidth: 280, marginTop: 14 }}>
                Structured paths through everything worth learning. Categories, topics, and lessons that always tell you what comes next.
              </p>
            </div>
            <div>
              <div className="foot-title">Explore</div>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/categories">All categories</Link>
                </li>
                <li>
                  <Link to="/search">Search</Link>
                </li>
                {user ? (
                  <li className="auth-user-only">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <div className="foot-title">Account</div>
              <ul>
                {user ? (
                  <li className="auth-user-only">
                    <Link to="/profile">Profile & settings</Link>
                  </li>
                ) : (
                  <li className="auth-guest-only">
                    <Link to="/auth">Log in / create account</Link>
                  </li>
                )}
                <li>
                  <Link to="/admin/login">Admin console</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-base">
            <span>© 2026 Primer. All rights reserved.</span>
            <span className="mono">v1.0</span>
          </div>
        </div>
      </footer>

      {/* Mobile drawer */}
      <div className={drawerOpen ? 'drawer open' : 'drawer'} id="drawer">
        <div className="drawer-scrim" onClick={() => setDrawerOpen(false)}></div>
        <div className="drawer-panel" role="dialog" aria-label="Menu">
          <div className="drawer-head">
            {user ? (
              <span className="flex center gap-2 auth-user-only">
                <span className="avatar">{user.initials}</span>
                <b className="ink">{user.name}</b>
              </span>
            ) : (
              <b className="ink auth-guest-only">Menu</b>
            )}
            <button className="btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <Icon name="x" />
            </button>
          </div>
          <form className="input-wrap" role="search" style={{ margin: '6px 4px 12px' }} onSubmit={onSearch}>
            <Icon name="search" />
            <input className="input" type="search" name="q" placeholder="Search topics…" />
          </form>
          <nav className="flex col" aria-label="Mobile">
            <NavLink to="/" end className={drawerLinkClass}>
              <Icon name="home" />
              Home
            </NavLink>
            <NavLink to="/categories" className={drawerLinkClass}>
              <Icon name="grid" />
              Categories
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={drawerLinkClass}>
                  <Icon name="layers" />
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={drawerLinkClass}>
                  <Icon name="user" />
                  Profile
                </NavLink>
                <div className="drawer-rule"></div>
                <Link
                  className="drawer-link"
                  to="/"
                  onClick={() => {
                    logout()
                  }}
                >
                  <Icon name="log-out" />
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <div className="drawer-rule"></div>
                <Link className="drawer-link" to="/auth">
                  <Icon name="log-in" />
                  Log in
                </Link>
                <Link className="drawer-link" to="/auth">
                  <Icon name="arrow-right" />
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
