/* UX-level admin gate for /admin/* — RLS is the real enforcement layer.
   Waits for the profile role before deciding, so admins don't get bounced
   to the login page during the first load. */
import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthProvider'
import { PageLoading } from '../../components/ui/LoadState'

export default function RequireAdmin() {
  const { user, isAdmin, roleReady } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  if (!roleReady) return <PageLoading />
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
