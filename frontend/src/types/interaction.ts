import type { NotificationType, ReportStatus, TargetType, ShareChannel, AiResponseStatus } from './common'
import type { User } from './user'

export interface LikeToggleRequest {
  targetId: number
  targetType: number
}

export interface ShareRequest {
  postId: number
  channel: ShareChannel
}

export interface Notification {
  id: number
  receiverId: number
  senderId?: number
  type: NotificationType
  title: string
  content: string
  relatedId?: number
  isRead: number
  createdAt: string
  sender?: User
}

export interface Report {
  id: number
  reporterId: number
  targetId: number
  targetType: TargetType
  reason: string
  status: ReportStatus
  handlerId?: number
  handleResult?: string
  handledAt?: string
  createdAt: string
}

export interface ReportCreateRequest {
  targetId: number
  targetType: number
  reason: string
}

export interface AiResponse {
  id: number
  postId: number
  content?: string
  model?: string
  promptTokens?: number
  completionTokens?: number
  status: AiResponseStatus
  errorMessage?: string
  createdAt: string
  updatedAt: string
}
