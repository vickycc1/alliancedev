import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/store/useAuthStore'
import HeaderSearch from '@/components/HeaderSearch'
import NotificationBell from '@/components/NotificationBell'

const { Header: AntHeader } = Layout
const { Text } = Typography

interface HeaderProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export default function Header({ collapsed, onCollapse }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
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
      <Space size="middle">
        <span
          onClick={() => onCollapse(!collapsed)}
          style={{ cursor: 'pointer', fontSize: 18, color: '#1F2329' }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
        <Text strong style={{ fontSize: 18, color: '#1677FF', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          TechCommunity
        </Text>
      </Space>

      <div style={{ flex: 1, maxWidth: 400, margin: '0 48px' }}>
        <HeaderSearch />
      </div>

      <Space size="middle">
        <NotificationBell />

        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={32}
                src={user.avatar}
                icon={!user.avatar && <UserOutlined />}
              />
              <Text style={{ color: '#1F2329' }}>{user.nickname || user.username}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Text
              style={{ color: '#1677FF', cursor: 'pointer' }}
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
            >
              登录
            </Text>
          </Space>
        )}
      </Space>
    </AntHeader>
  )
}
