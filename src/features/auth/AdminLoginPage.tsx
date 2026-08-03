import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useDocTitle } from '../../lib/useDocTitle'

export default function AdminLoginPage() {
  useDocTitle('Admin sign in — Primer')
  const navigate = useNavigate()

  /* M0: navigates straight in — real role-checked sign-in lands in M4. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate('/admin')
  }

  return (
    <main className="auth-wrap">
      <Link className="logo" to="/" style={{ marginBottom: 30 }}>
        <span className="logo-mark" aria-hidden="true"></span>Primer <span className="admin-tag">ADMIN</span>
      </Link>

      <div className="card card-pad auth-card">
        <h1 style={{ fontSize: 22 }}>Admin console</h1>
        <p className="small muted" style={{ marginTop: 6 }}>
          Manage categories, subcategories, topics, and lesson content.
        </p>

        <form className="flex col gap-4" style={{ marginTop: 22 }} onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="ad-email">
              Admin email
            </label>
            <div className="input-wrap">
              <Icon name="mail" />
              <input className="input" id="ad-email" type="email" placeholder="admin@primer.app" />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="ad-pass">
              Password
            </label>
            <div className="input-wrap">
              <Icon name="lock" />
              <input className="input" id="ad-pass" type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Sign in to admin
          </button>
        </form>
      </div>

      <p className="small muted" style={{ marginTop: 20 }}>
        Not an admin? <Link to="/">Back to the learner app</Link>
      </p>
    </main>
  )
}
