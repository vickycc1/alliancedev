import request from './index'
import type { Result, PageResult, PageParams } from '@/types/common'
import type {
  AdminStats,
  AdminUserQuery,
  AdminCategoryCreate,
  AdminCategoryUpdate,
  AdminPostQuery,
  AdminReportQuery,
  AdminReportHandle,
  AdminSystemConfig,
  SensitiveWord,
  CategoryTreeNode,
  PostListItem,
  ReportListItem,
} from '@/types/admin'
import type { User } from '@/types/user'

export function getAdminStats() {
  return request.get<Result<AdminStats>>('/admin/stats')
}

export function getAdminUsers(params: AdminUserQuery) {
  return request.get<Result<PageResult<User>>>('/admin/users', { params })
}

export function getAdminUserDetail(id: number) {
  return request.get<Result<User>>(`/admin/users/${id}`)
}

export function updateUserStatus(id: number, status: number) {
  return request.put<Result<void>>(`/admin/users/${id}/status`, { status })
}

export function updateUserRoles(id: number, roles: string[]) {
  return request.put<Result<void>>(`/admin/users/${id}/roles`, { roles })
}

export function getCategoryTree() {
  return request.get<Result<CategoryTreeNode[]>>('/admin/categories/tree')
}

export function createCategory(data: AdminCategoryCreate) {
  return request.post<Result<void>>('/admin/categories', data)
}

export function updateCategory(id: number, data: AdminCategoryUpdate) {
  return request.put<Result<void>>(`/admin/categories/${id}`, data)
}

export function deleteCategory(id: number) {
  return request.delete<Result<void>>(`/admin/categories/${id}`)
}

export function getAdminPosts(params: AdminPostQuery) {
  return request.get<Result<PageResult<PostListItem>>>('/admin/posts', { params })
}

export function togglePostTop(id: number, isTop: boolean) {
  return request.put<Result<void>>(`/admin/posts/${id}/top`, { isTop })
}

export function togglePostEssence(id: number, isEssence: boolean) {
  return request.put<Result<void>>(`/admin/posts/${id}/essence`, { isEssence })
}

export function blockPost(id: number) {
  return request.put<Result<void>>(`/admin/posts/${id}/block`)
}

export function movePost(id: number, categoryId: number) {
  return request.put<Result<void>>(`/admin/posts/${id}/move`, { categoryId })
}

export function deletePost(id: number) {
  return request.delete<Result<void>>(`/admin/posts/${id}`)
}

export function getAdminReports(params: AdminReportQuery) {
  return request.get<Result<PageResult<ReportListItem>>>('/admin/reports', { params })
}

export function getAdminReportDetail(id: number) {
  return request.get<Result<ReportListItem>>(`/admin/reports/${id}`)
}

export function handleReport(id: number, data: AdminReportHandle) {
  return request.put<Result<void>>(`/admin/reports/${id}/handle`, data)
}

export function getSystemConfig() {
  return request.get<Result<AdminSystemConfig>>('/admin/config')
}

export function updateSystemConfig(data: Partial<AdminSystemConfig>) {
  return request.put<Result<void>>('/admin/config', data)
}

export function getSensitiveWords(params: PageParams & { keyword?: string }) {
  return request.get<Result<PageResult<SensitiveWord>>>('/admin/sensitive-words', { params })
}

export function addSensitiveWord(word: string) {
  return request.post<Result<void>>('/admin/sensitive-words', { word })
}

export function deleteSensitiveWord(id: number) {
  return request.delete<Result<void>>(`/admin/sensitive-words/${id}`)
}

export function batchImportSensitiveWords(words: string[]) {
  return request.post<Result<{ imported: number }>>('/admin/sensitive-words/batch', { words })
}
