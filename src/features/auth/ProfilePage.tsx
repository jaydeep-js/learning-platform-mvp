import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import Icon from '../../components/icons/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from './AuthProvider'
import { useDocTitle } from '../../lib/useDocTitle'
import { supabase } from '../../lib/supabase'
import { keys } from '../../data/keys'

export default function ProfilePage() {
  useDocTitle('Profile & settings — Primer')
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <main>
        <div className="container section auth-guest-only">
          <div className="card" style={{ maxWidth: 560, margin: '24px auto' }}>
            <div className="empty">
              <div className="empty-icon">
                <Icon name="user" />
              </div>
              <h3>Profile settings need an account</h3>
              <p className="small" style={{ maxWidth: 400 }}>
                Log in to manage your name, email, password, and preferences.
              </p>
              <div className="flex gap-3 wrap" style={{ justifyContent: 'center' }}>
                <Link className="btn btn-primary" to="/auth">
                  Log in
                </Link>
                <Link className="btn btn-secondary" to="/">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const refreshProfile = () => queryClient.invalidateQueries({ queryKey: keys.profile(user.id) })

  const onSaveAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const fullName = String(form.get('full_name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    setSaving(true)
    try {
      if (fullName && fullName !== user.name) {
        const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
        if (error) throw error
      }
      if (email && email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email })
        if (error) throw error
        toast('Check your new inbox to confirm the email change')
      } else {
        toast('Changes saved')
      }
      void refreshProfile()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save changes")
    } finally {
      setSaving(false)
    }
  }

  const onUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const current = String(form.get('current') ?? '')
    const next = String(form.get('next') ?? '')
    if (next.length < 8) {
      toast('New password needs at least 8 characters')
      return
    }
    setSaving(true)
    try {
      /* Re-authenticate before changing the password. */
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email: user.email, password: current })
      if (reauthError) {
        toast("Current password isn't right")
        return
      }
      const { error } = await supabase.auth.updateUser({ password: next })
      if (error) throw error
      toast('Password updated')
      e.currentTarget?.reset?.()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update password")
    } finally {
      setSaving(false)
    }
  }

  const onTogglePref = async (pref: 'pref_weekly_recap' | 'pref_streak_reminder', value: boolean) => {
    const patch = pref === 'pref_weekly_recap' ? { pref_weekly_recap: value } : { pref_streak_reminder: value }
    const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
    if (error) toast("Couldn't save that preference")
    else void refreshProfile()
  }

  return (
    <main>
      <div className="auth-user-only">
        <div className="container page-head">
          <p className="eyebrow">Your account</p>
          <h1 style={{ marginTop: 8 }}>Profile &amp; settings</h1>
          <p className="ph-desc">Your account details, password, and learning preferences.</p>
        </div>

        <div className="container section-tight">
          <div className="account-layout">
            <aside className="account-side">
              <div className="side-title">Your learning</div>
              <nav className="flex col" style={{ gap: 2 }} aria-label="Account">
                <Link className="side-link" to="/dashboard">
                  <Icon name="grid" className="icon-sm icon" />
                  Overview
                </Link>
                <Link className="side-link" to="/dashboard#continue">
                  <Icon name="play" className="icon-sm icon" />
                  Continue learning
                </Link>
                <Link className="side-link" to="/dashboard#bookmarks">
                  <Icon name="bookmark" className="icon-sm icon" />
                  Bookmarks
                </Link>
                <Link className="side-link active" to="/profile" aria-current="page">
                  <Icon name="user" className="icon-sm icon" />
                  Profile &amp; settings
                </Link>
              </nav>
            </aside>

            <div className="account-main" style={{ maxWidth: 620 }}>
              <div className="card card-pad">
                <h2 style={{ fontSize: 18 }}>Account details</h2>
                <div className="flex center gap-4" style={{ marginTop: 18 }}>
                  <span className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
                    {user.initials}
                  </span>
                  <div>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast('Avatar upload is coming soon')}>
                      Change avatar
                    </button>
                    <p className="hint" style={{ marginTop: 8 }}>
                      JPG or PNG, at least 200×200px.
                    </p>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--line)', margin: '22px 0' }}></div>
                <form className="flex col gap-4" onSubmit={(e) => void onSaveAccount(e)}>
                  <div className="field">
                    <label className="label" htmlFor="pf-name">
                      Full name
                    </label>
                    <input className="input" id="pf-name" name="full_name" key={user.name} defaultValue={user.name} />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="pf-email">
                      Email
                    </label>
                    <input className="input" id="pf-email" name="email" type="email" defaultValue={user.email} />
                    <p className="hint">Changing your email sends a confirmation link to the new address.</p>
                  </div>
                  <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" type="reset">
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      Save changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="card card-pad" style={{ marginTop: 18 }}>
                <h2 style={{ fontSize: 18 }}>Password</h2>
                <form className="flex col gap-4" style={{ marginTop: 16 }} onSubmit={(e) => void onUpdatePassword(e)}>
                  <div className="field">
                    <label className="label" htmlFor="pw-cur">
                      Current password
                    </label>
                    <input className="input" id="pw-cur" name="current" type="password" placeholder="••••••••" autoComplete="current-password" />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="pw-new">
                      New password
                    </label>
                    <input className="input" id="pw-new" name="next" type="password" placeholder="••••••••" autoComplete="new-password" />
                    <p className="hint">At least 8 characters.</p>
                  </div>
                  <div className="flex" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      Update password
                    </button>
                  </div>
                </form>
              </div>

              <div className="card card-pad" style={{ marginTop: 18 }} id="preferences">
                <h2 style={{ fontSize: 18 }}>Preferences</h2>
                <div className="flex col" style={{ gap: 18, marginTop: 16 }}>
                  <label className="flex center between" style={{ cursor: 'pointer', gap: 16 }}>
                    <span>
                      <span className="small w-600 ink" style={{ display: 'block' }}>
                        Email me a weekly progress recap
                      </span>
                      <span className="hint">One email, every Monday morning.</span>
                    </span>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={user.prefWeeklyRecap}
                        onChange={(e) => void onTogglePref('pref_weekly_recap', e.target.checked)}
                      />
                      <span className="track"></span>
                    </span>
                  </label>
                  <label className="flex center between" style={{ cursor: 'pointer', gap: 16 }}>
                    <span>
                      <span className="small w-600 ink" style={{ display: 'block' }}>
                        Remind me when a streak is about to break
                      </span>
                      <span className="hint">A nudge if you haven't learned by 8 PM.</span>
                    </span>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={user.prefStreakReminder}
                        onChange={(e) => void onTogglePref('pref_streak_reminder', e.target.checked)}
                      />
                      <span className="track"></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
