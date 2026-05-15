import { useState, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Avatar, Dropdown, Space, theme, Breadcrumb, Tabs } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  FlagOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/store/useAuthStore'

const { Sider, Content, Header: AntHeader } = Layout
const { Text } = Typography

const pathLabelMap: Record<string, string> = {
  '/': '系统概览',
  '/users': '用户管理',
  '/categories': '板块管理',
  '/posts': '帖子管理',
  '/reports': '举报管理',
  '/config': '系统配置',
}

const adminMenuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '系统概览',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/categories',
    icon: <AppstoreOutlined />,
    label: '板块管理',
  },
  {
    key: '/posts',
    icon: <FileTextOutlined />,
    label: '帖子管理',
  },
  {
    key: '/reports',
    icon: <FlagOutlined />,
    label: '举报管理',
  },
  {
    key: '/config',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
]

interface TabItem {
  key: string
  label: string
  closable: boolean
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const { token: themeToken } = theme.useToken()

  const [tabs, setTabs] = useState<TabItem[]>([
    { key: '/', label: '系统概览', closable: false },
  ])

  const currentPath = location.pathname
  const currentLabel = pathLabelMap[currentPath] || '页面'

  const addTab = useCallback((path: string) => {
    const label = pathLabelMap[path] || '页面'
    setTabs((prev) => {
      if (prev.some((t) => t.key === path)) return prev
      return [...prev, { key: path, label, closable: path !== '/' }]
    })
  }, [])

  const removeTab = useCallback((targetKey: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.key !== targetKey)
      if (currentPath === targetKey && next.length > 0) {
        const last = next[next.length - 1]
        navigate(last.key)
      }
      return next
    })
  }, [currentPath, navigate])

  const handleTabClick = useCallback((key: string) => {
    navigate(key)
  }, [navigate])

  if (!tabs.some((t) => t.key === currentPath)) {
    addTab(currentPath)
  }

  const selectedKeys = [currentPath]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    addTab(key)
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'frontend',
      icon: <HomeOutlined />,
      label: '返回前台',
      onClick: () => window.open('http://localhost:3000', '_blank'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        collapsedWidth={64}
        style={{
          background: '#1F2329',
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
        theme="dark"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: 8,
        }}>
          <DashboardOutlined style={{ color: '#4F46E5', fontSize: 22 }} />
          {!collapsed && (
            <Text strong style={{ color: '#FFFFFF', fontSize: 16, letterSpacing: 1 }}>
              管理后台
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={adminMenuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 'none', marginTop: 8 }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <AntHeader style={{
          padding: '0 24px',
          background: themeToken.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ cursor: 'pointer', fontSize: 18, color: themeToken.colorTextSecondary }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Breadcrumb
              items={[
                { title: <HomeOutlined /> },
                { title: currentLabel },
              ]}
            />
          </div>
          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
              {user && (
                <Text style={{ color: themeToken.colorText }}>
                  {user.nickname || user.username}
                </Text>
              )}
            </Space>
          </Dropdown>
        </AntHeader>
        {tabs.length > 1 && (
          <div style={{
            background: themeToken.colorBgContainer,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
            padding: '4px 16px 0',
          }}>
            <Tabs
              activeKey={currentPath}
              onChange={handleTabClick}
              type="editable-card"
              hideAdd
              onEdit={(targetKey, action) => {
                if (action === 'remove' && typeof targetKey === 'string') {
                  removeTab(targetKey)
                }
              }}
              items={tabs.map((tab) => ({
                key: tab.key,
                label: tab.label,
                closable: tab.closable,
              }))}
              size="small"
            />
          </div>
        )}
        <Content style={{
          margin: 24,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
