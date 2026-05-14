export interface Result<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = unknown> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface PageParams {
  page?: number
  size?: number
}

export enum UserStatus {
  DISABLED = 0,
  NORMAL = 1,
  MUTED = 2,
}

export enum PostStatus {
  DRAFT = 0,
  NORMAL = 1,
  BLOCKED = 2,
  DELETED = 3,
}

export enum CommentStatus {
  BLOCKED = 0,
  NORMAL = 1,
  DELETED = 2,
}

export enum CategoryStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export enum NotificationType {
  COMMENT = 1,
  LIKE = 2,
  FAVORITE = 3,
  SYSTEM = 4,
  AI_COMPLETED = 5,
  REPORT_HANDLED = 6,
}

export enum ReportStatus {
  PENDING = 0,
  BLOCKED = 1,
  IGNORED = 2,
  WARNED = 3,
}

export enum TargetType {
  POST = 1,
  COMMENT = 2,
  USER = 3,
}

export enum AiResponseStatus {
  GENERATING = 0,
  COMPLETED = 1,
  FAILED = 2,
}

export enum ShareChannel {
  WECHAT = 'WECHAT',
  LINK = 'LINK',
  COPY = 'COPY',
}

export enum RoleCode {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

export enum SortBy {
  LATEST = 'LATEST',
  HOT = 'HOT',
  TOP = 'TOP',
}

export enum ResourceType {
  MENU = 'MENU',
  BUTTON = 'BUTTON',
  API = 'API',
}
