import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/useAuthStore'
import { useWebSocket } from '@/hooks/useWebSocket'

const { Content } = Layout

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAuthStore((s) => s.user)

  useWebSocket({ enabled: !!user })

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header collapsed={collapsed} onCollapse={setCollapsed} />
        <Content style={{
          padding: 24,
          background: '#F2F3F5',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
