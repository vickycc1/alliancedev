import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Input, Avatar, Dropdown, Badge, Space, Typography } from 'antd'
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'

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
  const unreadCount = useNotificationStore((s) => s.unreadCount)

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

      <Space size="middle" style={{ flex: 1, maxWidth: 400, margin: '0 48px' }}>
        <Input
          placeholder="搜索帖子、用户..."
          prefix={<SearchOutlined style={{ color: '#8F959E' }} />}
          style={{ borderRadius: 6 }}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value.trim()
            if (value) navigate(`/search?keyword=${encodeURIComponent(value)}`)
          }}
        />
      </Space>

      <Space size="middle">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined
            style={{ fontSize: 20, cursor: 'pointer', color: '#1F2329' }}
            onClick={() => navigate('/notifications')}
          />
        </Badge>

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
