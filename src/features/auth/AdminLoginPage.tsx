import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useDocTitle } from '../../lib/useDocTitle'
import { supabase } from '../../lib/supabase'

export default function AdminLoginPage() {
  useDocTitle('Admin sign in — Primer')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    setFormError('')
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setFormError(error.message === 'Invalid login credentials' ? "That email and password don't match." : error.message)
        return
      }
      /* Gate is UX only — RLS blocks non-admin writes regardless. */
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        setFormError("This account doesn't have admin access.")
        return
      }
      navigate('/admin')
    } finally {
      setBusy(false)
    }
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

        <form className="flex col gap-4" style={{ marginTop: 22 }} onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label className="label" htmlFor="ad-email">
              Admin email
            </label>
            <div className="input-wrap">
              <Icon name="mail" />
              <input className="input" id="ad-email" name="email" type="email" placeholder="admin@primer.app" autoComplete="email" />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="ad-pass">
              Password
            </label>
            <div className="input-wrap">
              <Icon name="lock" />
              <input className="input" id="ad-pass" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
            </div>
          </div>
          {formError ? (
            <p className="hint" style={{ color: 'var(--red)' }} role="alert">
              {formError}
            </p>
          ) : null}
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>
      </div>

      <p className="small muted" style={{ marginTop: 20 }}>
        Not an admin? <Link to="/">Back to the learner app</Link>
      </p>
    </main>
  )
}
