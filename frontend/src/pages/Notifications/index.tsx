import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography, Tabs, Avatar, Button, Empty, Spin, Space, Tag, Card,
} from 'antd'
import { UserOutlined, CheckOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/store/useNotificationStore'
import { NotificationType } from '@/types/common'
import type { Notification } from '@/types/interaction'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Title, Text } = Typography

const typeAccentMap: Record<number, { label: string; accent: string; bg: string; tagBg: string; tagColor: string }> = {
  [NotificationType.COMMENT]: { label: '评论', accent: '#1677FF', bg: '#EFF6FF', tagBg: '#EFF6FF', tagColor: '#1677FF' },
  [NotificationType.LIKE]: { label: '点赞', accent: '#F5222D', bg: '#FFF1F0', tagBg: '#FFF1F0', tagColor: '#F5222D' },
  [NotificationType.FAVORITE]: { label: '收藏', accent: '#FAAD14', bg: '#FFFBE6', tagBg: '#FFFBE6', tagColor: '#D48806' },
  [NotificationType.SYSTEM]: { label: '系统', accent: '#8F959E', bg: '#F7F8FA', tagBg: '#F7F8FA', tagColor: '#646A73' },
  [NotificationType.AI_COMPLETED]: { label: 'AI', accent: '#52C41A', bg: '#F6FFED', tagBg: '#F6FFED', tagColor: '#389E0D' },
  [NotificationType.REPORT_HANDLED]: { label: '举报', accent: '#FA8C16', bg: '#FFF7E6', tagBg: '#FFF7E6', tagColor: '#D46B08' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchNotifications(1, 50)
  }, [fetchNotifications])

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => n.isRead === 0)
    : notifications

  const handleItemClick = async (item: Notification) => {
    if (item.isRead === 0) {
      await markAsRead(item.id)
    }
    if (item.relatedId) {
      navigate(`/post/${item.relatedId}`)
    }
  }

  const handleMarkAll = async () => {
    await markAllAsRead()
  }

  const tabItems = [
    {
      key: 'all',
      label: `全部 (${notifications.length})`,
    },
    {
      key: 'unread',
      label: `未读 (${unreadCount})`,
    },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <Title level={3} style={{ margin: 0 }}>消息通知</Title>
        {unreadCount > 0 && (
          <Button
            icon={<CheckOutlined />}
            onClick={handleMarkAll}
            size="small"
          >
            全部标记已读
          </Button>
        )}
      </div>

      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ padding: '0 24px' }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '40px 0' }}>
            <Empty
              description={activeTab === 'unread' ? '没有未读通知' : '暂无通知'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.map((item, index) => {
              const config = typeAccentMap[item.type] || typeAccentMap[NotificationType.SYSTEM]
              const isUnread = item.isRead === 0
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px 24px 16px 28px',
                    cursor: item.relatedId ? 'pointer' : 'default',
                    position: 'relative',
                    background: isUnread ? config.bg : 'transparent',
                    borderLeft: isUnread ? `3px solid ${config.accent}` : '3px solid transparent',
                    borderBottom: index < filteredNotifications.length - 1 ? '1px solid #F0F0F0' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isUnread ? config.bg : '#F7F8FA'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isUnread ? config.bg : 'transparent'
                  }}
                >
                  <Avatar
                    size={40}
                    src={item.sender?.avatar}
                    icon={!item.sender?.avatar && <UserOutlined />}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}>
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: 11,
                          lineHeight: '18px',
                          background: config.tagBg,
                          color: config.tagColor,
                          border: 'none',
                          borderRadius: 4,
                          padding: '0 6px',
                        }}
                      >
                        {config.label}
                      </Tag>
                      <Text
                        strong={isUnread}
                        style={{
                          fontSize: 14,
                          color: isUnread ? '#1F2329' : '#646A73',
                        }}
                      >
                        {item.title}
                      </Text>
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: isUnread ? '#646A73' : '#8F959E',
                      marginBottom: 4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineClamp: 2,
                      lineHeight: '20px',
                    }}>
                      {item.content}
                    </div>
                    <div style={{ fontSize: 12, color: '#C9CDD4' }}>
                      {dayjs(item.createdAt).fromNow()}
                    </div>
                  </div>
                  {isUnread && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: config.accent,
                      flexShrink: 0,
                      marginTop: 10,
                      boxShadow: `0 0 0 2px ${config.accent}33`,
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
