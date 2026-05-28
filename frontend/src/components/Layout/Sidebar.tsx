import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  HomeOutlined,
  FireOutlined,
  StarOutlined,
  EditOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/hot',
      icon: <FireOutlined />,
      label: '热门',
    },
    {
      key: '/essence',
      icon: <StarOutlined />,
      label: '精华',
    },
    {
      key: '/favorites',
      icon: <HeartOutlined />,
      label: '收藏',
    },
    {
      key: '/new-post',
      icon: <EditOutlined />,
      label: '发帖',
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key)
    }
  }

  const selectedKeys = [location.pathname]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      collapsedWidth={64}
      style={{
        background: '#F7F8FA',
        borderRight: '1px solid #DEE0E3',
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          borderRight: 'none',
        }}
      />
    </Sider>
  )
}
