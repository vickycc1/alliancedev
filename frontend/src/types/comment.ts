import type { User } from './user'

export interface Comment {
  id: number
  postId: number
  parentId: number
  content: string
  likeCount: number
  status: number
  createdAt: string
}

export interface CommentWithUser extends Comment {
  author: User
  replyToUser?: User
  liked: boolean
  children?: CommentWithUser[]
}

export interface CommentCreateRequest {
  postId: number
  parentId?: number
  replyToUserId?: number
  content: string
}
