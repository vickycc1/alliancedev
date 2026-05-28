import type { PostStatus, SortBy } from './common'
import type { User } from './user'
import type { AiResponse } from './interaction'

export interface Post {
  id: number
  categoryId: number
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

export interface PostResponse {
  id: number
  categoryId: number
  categoryName: string
  author: User
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
  status: number
  aiResponse?: AiResponse
  liked: boolean
  favorited: boolean
  createdAt: string
  updatedAt: string
}

export interface PostListItem {
  id: number
  title: string
  summary?: string
  content?: string
  categoryId: number
  categoryName: string
  author: User
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  shareCount?: number
  isTop: number
  isEssence: number
  aiRequested: number
  status: number
  liked?: boolean
  favorited?: boolean
  aiResponse?: AiResponse
  createdAt: string
  updatedAt?: string
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
