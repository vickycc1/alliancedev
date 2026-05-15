import { useEffect } from 'react'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
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

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4F46E5',
          borderRadius: 8,
          colorBgContainer: '#FFFFFF',
        },
      }}
    >
      <AntApp>
        <AppRoutes />
      </AntApp>
    </ConfigProvider>
  )
}

export default App
