/* Landing page for the resetPasswordForEmail link. Supabase redirects here
   with a recovery session already established; the form sets a new password. */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Icon from '../../components/icons/Icon'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthProvider'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters.'),
})

export default function ResetPasswordPage() {
  useDocTitle('Set a new password — Primer')
  const { user } = useAuth()
  const [formError, setFormError] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError('')
    const { error } = await supabase.auth.updateUser({ password: values.password })
    if (error) {
      setFormError(error.message)
      return
    }
    toast('Password updated')
    navigate('/dashboard')
  })

  return (
    <main className="auth-wrap">
      <Link className="logo" to="/" style={{ marginBottom: 30 }}>
        <span className="logo-mark" aria-hidden="true"></span>Primer
      </Link>

      <div className="card card-pad auth-card">
        <h1 style={{ fontSize: 22 }}>Set a new password</h1>
        {user ? (
          <form className="flex col gap-4" style={{ marginTop: 22 }} onSubmit={onSubmit} noValidate>
            <div className="field">
              <label className="label" htmlFor="rp-pass">
                New password
              </label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input className="input" id="rp-pass" type="password" placeholder="••••••••" autoComplete="new-password" {...form.register('password')} />
              </div>
              <p className="hint">At least 8 characters.</p>
              {form.formState.errors.password?.message ? (
                <p className="hint" style={{ color: 'var(--red)' }} role="alert">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p className="hint" style={{ color: 'var(--red)' }} role="alert">
                {formError}
              </p>
            ) : null}
            <button className="btn btn-primary btn-block" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        ) : (
          <>
            <p className="small muted" style={{ marginTop: 8 }}>
              This reset link is invalid or has expired. Request a new one from the log-in page.
            </p>
            <Link className="btn btn-secondary btn-block" style={{ marginTop: 18 }} to="/auth">
              Back to log in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
