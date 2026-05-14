import type { CategoryStatus } from './common'

export interface Category {
  id: number
  parentId: number
  name: string
  icon?: string
  description?: string
  sortOrder: number
  status: CategoryStatus
  postCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

export interface CategoryCreateRequest {
  parentId?: number
  name: string
  icon?: string
  description?: string
  sortOrder?: number
}

export interface CategoryUpdateRequest {
  name?: string
  icon?: string
  description?: string
  sortOrder?: number
}
