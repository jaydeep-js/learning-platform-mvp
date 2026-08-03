/* M0 fake session provider. Exposes the same useAuth() surface the real
   Supabase AuthProvider will implement in M3, so pages never restructure.
   Session state is read synchronously from localStorage (the React
   equivalent of the prototype's pre-paint data-auth script — no flicker). */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface AuthUser {
  name: string
  email: string
  initials: string
}

interface AuthState {
  user: AuthUser | null
  isAdmin: boolean
  loading: boolean
  login: () => void
  logout: () => void
}

const DEMO_USER: AuthUser = { name: 'Aditi Chauhan', email: 'aditi.chauhan@example.com', initials: 'AC' }
const STORAGE_KEY = 'primer_auth'

const AuthContext = createContext<AuthState | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    localStorage.getItem(STORAGE_KEY) === 'user' ? DEMO_USER : null,
  )

  const login = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'user')
    setUser(DEMO_USER)
  }, [])

  const logout = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'guest')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin: user !== null, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
