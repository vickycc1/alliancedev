import type { NotificationType, ReportStatus, TargetType, ShareChannel, AiResponseStatus } from './common'
import type { UserPublic } from './user'

export interface Like {
  id: number
  userId: number
  targetId: number
  targetType: TargetType
  createdAt: string
}

export interface LikeToggleRequest {
  targetId: number
  targetType: TargetType
}

export interface Favorite {
  id: number
  userId: number
  postId: number
  createdAt: string
}

export interface Share {
  id: number
  userId: number
  postId: number
  channel?: ShareChannel
  createdAt: string
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
  sender?: UserPublic
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
  targetType: TargetType
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
