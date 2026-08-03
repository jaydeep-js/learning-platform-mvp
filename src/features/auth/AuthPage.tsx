import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Icon from '../../components/icons/Icon'
import { useToast } from '../../components/ui/Toast'
import { useDocTitle } from '../../lib/useDocTitle'
import { supabase } from '../../lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

const registerSchema = z.object({
  fullName: z.string().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters.'),
  terms: z.literal(true, { message: 'Please accept the terms to continue' }),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="hint" style={{ color: 'var(--red)' }} role="alert">
      {message}
    </p>
  ) : null
}

export default function AuthPage() {
  useDocTitle('Log in or create account — Primer')
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [formError, setFormError] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const register = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onLogin = login.handleSubmit(async (values) => {
    setFormError('')
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
    if (error) {
      setFormError(error.message === 'Invalid login credentials' ? "That email and password don't match." : error.message)
      return
    }
    navigate('/dashboard')
  })

  const onRegister = register.handleSubmit(async (values) => {
    setFormError('')
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    })
    if (error) {
      setFormError(error.message)
      return
    }
    if (!data.session) {
      setFormError('Check your inbox to confirm your email, then log in.')
      return
    }
    navigate('/dashboard')
  })

  const onForgot = async () => {
    const email = login.getValues('email')
    if (!email) {
      setFormError('Enter your email above first, then tap "Forgot password?"')
      return
    }
    setFormError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) setFormError(error.message)
    else toast('Password reset email sent')
  }

  return (
    <main className="auth-wrap">
      <Link className="logo" to="/" style={{ marginBottom: 30 }}>
        <span className="logo-mark" aria-hidden="true"></span>Primer
      </Link>

      <h1 className="visually-hidden">Log in or create your Primer account</h1>

      <div className="card card-pad auth-card">
        <div className="tabs" style={{ marginBottom: 22 }}>
          <button
            className={tab === 'login' ? 'tab-btn active' : 'tab-btn'}
            type="button"
            onClick={() => {
              setTab('login')
              setFormError('')
            }}
          >
            Log in
          </button>
          <button
            className={tab === 'register' ? 'tab-btn active' : 'tab-btn'}
            type="button"
            onClick={() => {
              setTab('register')
              setFormError('')
            }}
          >
            Create account
          </button>
        </div>

        {tab === 'login' ? (
          <form className="flex col gap-4" onSubmit={onLogin} noValidate>
            <div className="field">
              <label className="label" htmlFor="li-email">
                Email
              </label>
              <div className="input-wrap">
                <Icon name="mail" />
                <input className="input" id="li-email" type="email" placeholder="you@email.com" autoComplete="email" {...login.register('email')} />
              </div>
              <FieldError message={login.formState.errors.email?.message} />
            </div>
            <div className="field">
              <label className="label" htmlFor="li-pass">
                Password
              </label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input className="input" id="li-pass" type="password" placeholder="••••••••" autoComplete="current-password" {...login.register('password')} />
              </div>
              <FieldError message={login.formState.errors.password?.message} />
            </div>
            <div className="flex center between">
              <label className="check-label">
                <input className="checkbox" type="checkbox" />
                Remember me
              </label>
              <button className="small w-600" type="button" style={{ color: 'var(--pen)' }} onClick={() => void onForgot()}>
                Forgot password?
              </button>
            </div>
            <FieldError message={formError} />
            <button className="btn btn-primary btn-block" type="submit" disabled={login.formState.isSubmitting}>
              {login.formState.isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        ) : (
          <form className="flex col gap-4" onSubmit={onRegister} noValidate>
            <div className="field">
              <label className="label" htmlFor="re-name">
                Full name
              </label>
              <div className="input-wrap">
                <Icon name="user" />
                <input className="input" id="re-name" placeholder="Jordan Lee" autoComplete="name" {...register.register('fullName')} />
              </div>
              <FieldError message={register.formState.errors.fullName?.message} />
            </div>
            <div className="field">
              <label className="label" htmlFor="re-email">
                Email
              </label>
              <div className="input-wrap">
                <Icon name="mail" />
                <input className="input" id="re-email" type="email" placeholder="you@email.com" autoComplete="email" {...register.register('email')} />
              </div>
              <FieldError message={register.formState.errors.email?.message} />
            </div>
            <div className="field">
              <label className="label" htmlFor="re-pass">
                Password
              </label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input className="input" id="re-pass" type="password" placeholder="••••••••" autoComplete="new-password" {...register.register('password')} />
              </div>
              <p className="hint">At least 8 characters.</p>
              <FieldError message={register.formState.errors.password?.message} />
            </div>
            <label className="check-label">
              <input className="checkbox" type="checkbox" {...register.register('terms')} />I agree to the Terms &amp; Privacy Policy
            </label>
            <FieldError message={register.formState.errors.terms?.message} />
            <FieldError message={formError} />
            <button className="btn btn-primary btn-block" type="submit" disabled={register.formState.isSubmitting}>
              {register.formState.isSubmitting ? 'Creating account…' : 'Create account'}
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
