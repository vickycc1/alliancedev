import type { PostStatus, SortBy } from './common'
import type { UserPublic } from './user'

export interface Post {
  id: number
  categoryId: number
  userId: number
  title: string
  content: string
  summary?: string
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  shareCount: number
  isTop: number
  isEssence: number
  aiRequested: number
  status: PostStatus
  createdAt: string
  updatedAt: string
}

export interface PostDetail extends Post {
  categoryName: string
  author: UserPublic
  liked: boolean
  favorited: boolean
}

export interface PostListItem {
  id: number
  title: string
  summary?: string
  categoryId: number
  categoryName: string
  author: UserPublic
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  isTop: number
  isEssence: number
  aiRequested: number
  status: PostStatus
  createdAt: string
}

export interface PostCreateRequest {
  categoryId: number
  title: string
  content: string
  aiRequested: boolean
}

export interface PostUpdateRequest {
  categoryId?: number
  title?: string
  content?: string
}

export interface PostQueryParams {
  categoryId?: number
  keyword?: string
  sortBy?: SortBy
  isTop?: boolean
  isEssence?: boolean
  authorId?: number
  page?: number
  size?: number
}
