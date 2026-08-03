import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../../components/icons/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from './AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'

export default function AuthPage() {
  useDocTitle('Log in or create account — Primer')
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  /* M0: fake session — real Supabase sign-in/sign-up lands in M3. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login()
    navigate('/dashboard')
  }

  return (
    <main className="auth-wrap">
      <Link className="logo" to="/" style={{ marginBottom: 30 }}>
        <span className="logo-mark" aria-hidden="true"></span>Primer
      </Link>

      <h1 className="visually-hidden">Log in or create your Primer account</h1>

      <div className="card card-pad auth-card">
        <div className="tabs" style={{ marginBottom: 22 }}>
          <button className={tab === 'login' ? 'tab-btn active' : 'tab-btn'} type="button" onClick={() => setTab('login')}>
            Log in
          </button>
          <button className={tab === 'register' ? 'tab-btn active' : 'tab-btn'} type="button" onClick={() => setTab('register')}>
            Create account
          </button>
        </div>

        {tab === 'login' ? (
          <form className="flex col gap-4" onSubmit={onSubmit}>
            <div className="field">
              <label className="label" htmlFor="li-email">
                Email
              </label>
              <div className="input-wrap">
                <Icon name="mail" />
                <input className="input" id="li-email" type="email" placeholder="you@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="li-pass">
                Password
              </label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input className="input" id="li-pass" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex center between">
              <label className="check-label">
                <input className="checkbox" type="checkbox" />
                Remember me
              </label>
              <button className="small w-600" type="button" style={{ color: 'var(--pen)' }} onClick={() => toast('Password reset email sent')}>
                Forgot password?
              </button>
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Log in
            </button>
          </form>
        ) : (
          <form className="flex col gap-4" onSubmit={onSubmit}>
            <div className="field">
              <label className="label" htmlFor="re-name">
                Full name
              </label>
              <div className="input-wrap">
                <Icon name="user" />
                <input className="input" id="re-name" placeholder="Jordan Lee" />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="re-email">
                Email
              </label>
              <div className="input-wrap">
                <Icon name="mail" />
                <input className="input" id="re-email" type="email" placeholder="you@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="re-pass">
                Password
              </label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input className="input" id="re-pass" type="password" placeholder="••••••••" />
              </div>
              <p className="hint">At least 8 characters.</p>
            </div>
            <label className="check-label">
              <input className="checkbox" type="checkbox" required />I agree to the Terms &amp; Privacy Policy
            </label>
            <button className="btn btn-primary btn-block" type="submit">
              Create account
            </button>
          </form>
        )}
      </div>

      <div className="or-rule">
        <span className="small muted">or</span>
      </div>

      <Link className="btn btn-secondary btn-lg btn-block" style={{ maxWidth: 420 }} to="/">
        Continue as guest <Icon name="arrow-right" className="icon-sm icon" />
      </Link>
      <p className="small muted" style={{ marginTop: 14, textAlign: 'center', maxWidth: 420 }}>
        Guests can browse every category and read lessons — create an account any time to keep your progress.
      </p>
    </main>
  )
}
