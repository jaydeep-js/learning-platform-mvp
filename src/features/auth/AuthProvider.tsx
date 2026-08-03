/* Real session provider (replaces the M0 fake — same useAuth() surface).
   First paint is blocked until getSession() resolves (localStorage-backed,
   effectively instant) so members never flash the guest chrome — the React
   equivalent of the prototype's pre-paint data-auth script. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface AuthUser {
  id: string
  name: string
  email: string
  initials: string
  prefWeeklyRecap: boolean
  prefStreakReminder: boolean
}

interface AuthState {
  user: AuthUser | null
  isAdmin: boolean
  /* False while the signed-in user's profile row (which carries the role) is
     still loading — admin guards must wait for it before redirecting. */
  roleReady: boolean
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

function initialsOf(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  if (parts.length === 1 && parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return (email[0] ?? '?').toUpperCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const queryClient = useQueryClient()

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      /* Deferred out of the callback: supabase-js holds an internal lock while
         emitting this event, and the re-render triggers queries that re-enter
         the client — updating synchronously deadlocks sign-in. */
      setTimeout(() => setSession(next), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const uid = session?.user.id ?? null

  /* Profile row: role + prefs + canonical name. Until it loads, name/initials
     fall back to the signup metadata carried in the session itself. */
  const profileQuery = useQuery({
    queryKey: ['profile', uid],
    enabled: uid !== null,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, pref_weekly_recap, pref_streak_reminder')
        .eq('id', uid!)
        .single()
      if (error) throw error
      return data
    },
  })

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthState>(() => {
    if (!session) return { user: null, isAdmin: false, roleReady: true, loading: session === undefined, logout }
    const email = session.user.email ?? ''
    const metaName = (session.user.user_metadata?.full_name as string | undefined) ?? ''
    const profile = profileQuery.data
    const name = profile?.full_name || metaName || email
    return {
      user: {
        id: session.user.id,
        name,
        email,
        initials: initialsOf(name, email),
        prefWeeklyRecap: profile?.pref_weekly_recap ?? true,
        prefStreakReminder: profile?.pref_streak_reminder ?? false,
      },
      isAdmin: profile?.role === 'admin',
      roleReady: profile !== undefined,
      loading: false,
      logout,
    }
  }, [session, profileQuery.data, logout])

  /* Block first paint until the stored session is resolved. */
  if (session === undefined) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
