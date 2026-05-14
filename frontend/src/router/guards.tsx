import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { RoleCode } from '@/types/common'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user?.roles.includes(RoleCode.ADMIN)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

interface GuestGuardProps {
  children: React.ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const redirect = searchParams.get('redirect') || '/'

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}
