import { useEffect } from 'react'
import AppRoutes from '@/router'
import { useAuthStore } from '@/store/useAuthStore'
import { getToken, isTokenExpired, clearTokens } from '@/api'

function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  useEffect(() => {
    const token = getToken()
    if (token) {
      if (isTokenExpired()) {
        clearTokens()
        useAuthStore.setState({ user: null, isAuthenticated: false })
      } else {
        fetchProfile()
      }
    }
  }, [fetchProfile])

  return <AppRoutes />
}

export default App
