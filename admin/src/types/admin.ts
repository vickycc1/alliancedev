import type { PageParams } from './common'

export interface AdminStats {
  userTotal: number
  userTodayNew: number
  postTotal: number
  postTodayNew: number
  commentTotal: number
  commentTodayNew: number
  reportPending: number
  aiCallCount: number
  aiSuccessRate: number
  activeTrend: Array<{ date: string; users: number; posts: number }>
}

export interface AdminUserQuery extends PageParams {
  keyword?: string
  status?: number
  role?: string
}

export interface AdminCategoryCreate {
  name: string
  parentId?: number
  icon?: string
  description?: string
  sortOrder?: number
}

export interface AdminCategoryUpdate {
  name?: string
  icon?: string
  description?: string
  sortOrder?: number
  status?: number
}

export interface AdminPostQuery extends PageParams {
  keyword?: string
  categoryId?: number
  status?: number
  isTop?: boolean
  isEssence?: boolean
}

export interface AdminReportQuery extends PageParams {
  status?: number
  targetType?: number
}

export interface AdminReportHandle {
  action: 'BLOCK' | 'IGNORE' | 'WARN'
  reason?: string
}

export interface AdminSystemConfig {
  aiBaseUrl: string
  aiApiKey: string
  aiModel: string
  aiTemperature: number
  aiMaxTokens: number
  aiEnabled: boolean
  casServerUrl: string
  casCallbackUrl: string
  postRateLimit: number
  commentRateLimit: number
  notificationRetentionDays: number
}

export interface SensitiveWord {
  id: number
  word: string
  createdAt: string
}

export interface CategoryTreeNode {
  id: number
  name: string
  parentId: number
  icon?: string
  description?: string
  sortOrder: number
  status: number
  postCount: number
  depth?: number
  children?: CategoryTreeNode[]
}

export interface PostListItem {
  id: number
  title: string
  authorId: number
  authorName: string
  authorAvatar: string
  categoryId: number
  categoryName: string
  status: number
  isTop: boolean
  isEssence: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface ReportListItem {
  id: number
  reporterId: number
  reporterName: string
  targetType: number
  targetId: number
  targetTitle: string
  targetContent: string
  reason: string
  status: number
  handlerName?: string
  handleResult?: string
  handleTime?: string
  createdAt: string
}
