import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  FlagOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider, Content, Header: AntHeader } = Layout
const { Text } = Typography

const adminMenuItems: MenuProps['items'] = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: '系统概览',
  },
  {
    key: '/admin/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/admin/categories',
    icon: <AppstoreOutlined />,
    label: '板块管理',
  },
  {
    key: '/admin/posts',
    icon: <FileTextOutlined />,
    label: '帖子管理',
  },
  {
    key: '/admin/reports',
    icon: <FlagOutlined />,
    label: '举报管理',
  },
  {
    key: '/admin/config',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const selectedKeys = [location.pathname]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
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
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>
            {collapsed ? 'TC' : '管理后台'}
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={adminMenuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 'none' }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <AntHeader style={{
          padding: '0 24px',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #DEE0E3',
          height: 64,
          lineHeight: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Text style={{ color: '#8F959E', fontSize: 14 }}>
            管理后台
          </Text>
          <Text
            style={{ color: '#1677FF', cursor: 'pointer', fontSize: 14 }}
            onClick={() => navigate('/')}
          >
            返回前台
          </Text>
        </AntHeader>
        <Content style={{
          padding: 24,
          background: '#F2F3F5',
          minHeight: 'calc(100vh - 64px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
