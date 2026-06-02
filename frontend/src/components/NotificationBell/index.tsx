import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Popover, Avatar, Button, Typography, Empty, Spin } from 'antd'
import { BellOutlined, UserOutlined, CheckOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { NotificationType } from '@/types/common'
import type { Notification } from '@/types/interaction'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Text } = Typography

const typeAccentMap: Record<number, { icon: React.ReactNode; accent: string; bg: string }> = {
  [NotificationType.COMMENT]: { icon: '💬', accent: '#1677FF', bg: '#EFF6FF' },
  [NotificationType.LIKE]: { icon: '👍', accent: '#F5222D', bg: '#FFF1F0' },
  [NotificationType.FAVORITE]: { icon: '⭐', accent: '#FAAD14', bg: '#FFFBE6' },
  [NotificationType.SYSTEM]: { icon: '📢', accent: '#8F959E', bg: '#F7F8FA' },
  [NotificationType.AI_COMPLETED]: { icon: '🤖', accent: '#52C41A', bg: '#F6FFED' },
  [NotificationType.REPORT_HANDLED]: { icon: '⚠️', accent: '#FA8C16', bg: '#FFF7E6' },
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const {
    unreadCount,
    notifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!isAuthenticated) return
    fetchUnreadCount()
    timerRef.current = setInterval(fetchUnreadCount, 30000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchUnreadCount, isAuthenticated])

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchNotifications(1, 10)
    }
  }

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

  const handleViewAll = () => {
    navigate('/notifications')
  }

  const content = (
    <div style={{ width: 340, display: 'flex', flexDirection: 'column', maxHeight: 480 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: '0 4px',
        flexShrink: 0,
      }}>
        <Text strong style={{ fontSize: 14 }}>通知</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAll}
            style={{ padding: 0, fontSize: 12, color: '#8F959E' }}
          >
            全部已读
          </Button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : notifications.length === 0 ? (
        <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {notifications.slice(0, 8).map((item) => {
            const typeInfo = typeAccentMap[item.type] || typeAccentMap[NotificationType.SYSTEM]
            const isUnread = item.isRead === 0
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 8px 10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  position: 'relative',
                  background: isUnread ? typeInfo.bg : 'transparent',
                  borderLeft: isUnread ? `3px solid ${typeInfo.accent}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isUnread ? typeInfo.bg : '#F7F8FA'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isUnread ? typeInfo.bg : 'transparent'
                }}
              >
                <Avatar
                  size={32}
                  src={item.sender?.avatar}
                  icon={!item.sender?.avatar && <UserOutlined />}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 2,
                  }}>
                    <span style={{ fontSize: 12 }}>{typeInfo.icon}</span>
                    <Text style={{
                      fontSize: 13,
                      fontWeight: isUnread ? 600 : 400,
                      color: isUnread ? '#1F2329' : '#646A73',
                    }}>
                      {item.title}
                    </Text>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: isUnread ? '#646A73' : '#8F959E',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineClamp: 2,
                    lineHeight: '18px',
                  }}>
                    {item.content}
                  </div>
                  <div style={{ fontSize: 11, color: '#C9CDD4', marginTop: 4 }}>
                    {dayjs(item.createdAt).fromNow()}
                  </div>
                </div>
                {isUnread && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: typeInfo.accent,
                    flexShrink: 0,
                    marginTop: 8,
                    boxShadow: `0 0 0 2px ${typeInfo.accent}33`,
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}
      </div>

      <div style={{
        textAlign: 'center',
        borderTop: '1px solid #F0F0F0',
        paddingTop: 8,
        marginTop: 8,
        flexShrink: 0,
      }}>
        <Button type="link" size="small" onClick={handleViewAll} style={{ color: '#8F959E' }}>
          查看全部通知
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      onOpenChange={handleOpenChange}
      overlayStyle={{ width: 380, padding: '12px 16px' }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <BellOutlined
          style={{ fontSize: 20, cursor: 'pointer', color: '#1F2329' }}
        />
      </Badge>
    </Popover>
  )
}
