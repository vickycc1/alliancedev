import { useEffect, useRef, useCallback } from 'react'
import { useNotificationStore } from '@/store/useNotificationStore'

interface UseWebSocketOptions {
  url?: string
  enabled?: boolean
  onMessage?: (data: unknown) => void
  reconnectInterval?: number
  maxRetries?: number
}

interface WebSocketMessage {
  type: string
  data: unknown
}

export function useWebSocket({
  url,
  enabled = true,
  onMessage,
  reconnectInterval = 5000,
  maxRetries = 10,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const { incrementUnread, fetchUnreadCount } = useNotificationStore()

  const wsUrl = url || (window.location.protocol === 'https:' ? 'wss:' : 'ws:') +
    '//' + window.location.host + '/ws/notifications'

  const connect = useCallback(() => {
    if (!enabled) return

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        retriesRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          switch (message.type) {
            case 'NOTIFICATION':
              incrementUnread()
              break
            case 'UNREAD_COUNT':
              fetchUnreadCount()
              break
            default:
              break
          }

          onMessage?.(message)
        } catch {
          onMessage?.(event.data)
        }
      }

      ws.onclose = () => {
        if (enabled && retriesRef.current < maxRetries) {
          retriesRef.current++
          timerRef.current = setTimeout(connect, reconnectInterval)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      if (enabled && retriesRef.current < maxRetries) {
        retriesRef.current++
        timerRef.current = setTimeout(connect, reconnectInterval)
      }
    }
  }, [wsUrl, enabled, onMessage, incrementUnread, fetchUnreadCount, reconnectInterval, maxRetries])

  const disconnect = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return { send, disconnect }
}
