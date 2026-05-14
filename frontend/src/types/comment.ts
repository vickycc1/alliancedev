import type { CommentStatus } from './common'
import type { UserPublic } from './user'

export interface Comment {
  id: number
  postId: number
  userId: number
  parentId: number
  replyToUserId?: number
  content: string
  likeCount: number
  status: CommentStatus
  createdAt: string
}

export interface CommentWithUser extends Comment {
  author: UserPublic
  replyToUser?: UserPublic
  liked: boolean
  children?: CommentWithUser[]
}

export interface CommentCreateRequest {
  postId: number
  parentId?: number
  replyToUserId?: number
  content: string
}
