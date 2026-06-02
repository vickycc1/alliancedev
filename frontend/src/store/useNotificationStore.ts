import { create } from 'zustand'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { Notification } from '@/types/interaction'

export type { Notification as NotificationItem } from '@/types/interaction'

interface NotificationState {
  unreadCount: number
  notifications: Notification[]
  loading: boolean

  fetchUnreadCount: () => Promise<void>
  fetchNotifications: (page?: number, size?: number) => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  incrementUnread: () => void
  resetUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  loading: false,

  fetchUnreadCount: async () => {
    try {
      const { data } = await request.get<Result<number>>('/notifications/unread-count')
      if (data.data !== undefined) {
        set({ unreadCount: data.data })
      }
    } catch {
      set({ unreadCount: 0 })
    }
  },

  fetchNotifications: async (page = 1, size = 20) => {
    set({ loading: true })
    try {
      const { data } = await request.get<Result<PageResult<Notification>>>('/notifications', {
        params: { page, size },
      })
      if (data.data) {
        set({ notifications: data.data.list })
      }
    } catch {
      set({ notifications: [] })
    } finally {
      set({ loading: false })
    }
  },

  markAsRead: async (id: number) => {
    await request.put(`/notifications/${id}/read`)
    const { notifications, unreadCount } = get()
    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, isRead: 1 } : n,
      ),
      unreadCount: Math.max(0, unreadCount - 1),
    })
  },

  markAllAsRead: async () => {
    await request.put('/notifications/read-all')
    const { notifications } = get()
    set({
      notifications: notifications.map((n) => ({ ...n, isRead: 1 })),
      unreadCount: 0,
    })
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }))
  },

  resetUnread: () => {
    set({ unreadCount: 0 })
  },
}))
