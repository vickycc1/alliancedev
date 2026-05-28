// import type { InternalAxiosRequestConfig } from 'axios'
// import type { Result, PageResult } from '@/types/common'
// import type { User, LoginResponse } from '@/types/user'
// import type { AdminSystemConfig } from '@/types/admin'
// import { RoleCode } from '@/types/common'
// import {
//   mockAdminUser,
//   mockUsers,
//   mockCategoryTree,
//   mockPosts,
//   mockReports,
//   mockStats,
//   mockSensitiveWords,
//   mockSystemConfig,
// } from './data'

// type MockResponse = { data: unknown; status?: number; delay?: number }

// const MOCK_DELAY = 300

// function ok<T>(data: T, delay = MOCK_DELAY): MockResponse {
//   return { data: { code: 200, message: 'success', data } as Result<T>, delay }
// }

// function paginate<T>(list: T[], page = 1, size = 10): PageResult<T> {
//   const start = (page - 1) * size
//   return {
//     list: list.slice(start, start + size),
//     total: list.length,
//     page,
//     size,
//   }
// }

// function matchUrl(url: string, pattern: string): Record<string, string> | null {
//   const urlParts = url.split('?')[0].split('/').filter(Boolean)
//   const patternParts = pattern.split('/').filter(Boolean)
//   if (urlParts.length !== patternParts.length) return null
//   const params: Record<string, string> = {}
//   for (let i = 0; i < patternParts.length; i++) {
//     if (patternParts[i].startsWith(':')) {
//       params[patternParts[i].slice(1)] = urlParts[i]
//     } else if (patternParts[i] !== urlParts[i]) {
//       return null
//     }
//   }
//   return params
// }

// function getQueryParams(url: string): Record<string, string> {
//   const search = url.split('?')[1]
//   if (!search) return {}
//   const params: Record<string, string> = {}
//   search.split('&').forEach((pair) => {
//     const [key, value] = pair.split('=')
//     params[decodeURIComponent(key)] = decodeURIComponent(value || '')
//   })
//   return params
// }

// let currentUser: User = mockAdminUser
// let wordIdCounter = mockSensitiveWords.length + 1

// const handlers: Array<{
//   method: string
//   pattern: string
//   handler: (params: Record<string, string>, query: Record<string, string>, body: unknown) => MockResponse
// }> = [
//   {
//     method: 'POST',
//     pattern: 'auth/login',
//     handler: (_p, _q, body) => {
//       const { username, password } = body as { username: string; password: string }
//       if (username === 'admin' && password === 'admin123') {
//         currentUser = mockAdminUser
//         const loginRes: LoginResponse = {
//           token: 'mock_admin_token_' + Date.now(),
//           refreshToken: 'mock_admin_refresh_' + Date.now(),
//           expiresIn: 86400,
//           user: mockAdminUser,
//         }
//         return ok(loginRes)
//       }
//       const user = mockUsers.find((u) => u.username === username)
//       if (user && password === '123456') {
//         currentUser = user
//         const loginRes: LoginResponse = {
//           token: 'mock_token_' + Date.now(),
//           refreshToken: 'mock_refresh_' + Date.now(),
//           expiresIn: 86400,
//           user,
//         }
//         return ok(loginRes)
//       }
//       return { data: { code: 401, message: '用户名或密码错误', data: null }, status: 401 }
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'auth/refresh',
//     handler: () => ok({
//       token: 'mock_admin_token_refreshed_' + Date.now(),
//       refreshToken: 'mock_admin_refresh_refreshed_' + Date.now(),
//       expiresIn: 86400,
//     }),
//   },
//   {
//     method: 'GET',
//     pattern: 'user/profile',
//     handler: () => ok(currentUser),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/stats',
//     handler: () => ok(mockStats),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/users',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       let filtered = [...mockUsers]
//       if (query.keyword) {
//         const kw = query.keyword.toLowerCase()
//         filtered = filtered.filter(
//           (u) => u.username.toLowerCase().includes(kw) || u.nickname.toLowerCase().includes(kw) || (u.email || '').toLowerCase().includes(kw),
//         )
//       }
//       if (query.status !== undefined && query.status !== '') {
//         filtered = filtered.filter((u) => u.status === Number(query.status))
//       }
//       if (query.role) {
//         filtered = filtered.filter((u) => u.roles.includes(query.role as RoleCode))
//       }
//       return ok(paginate(filtered, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/users/:id',
//     handler: (params) => {
//       const user = mockUsers.find((u) => u.id === Number(params.id))
//       if (!user) return { data: { code: 404, message: '用户不存在', data: null } }
//       return ok(user)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/users/:id/status',
//     handler: (params, _q, body) => {
//       const { status } = body as { status: number }
//       const user = mockUsers.find((u) => u.id === Number(params.id))
//       if (user) user.status = status
//       return ok(null)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/users/:id/roles',
//     handler: (params, _q, body) => {
//       const { roles } = body as { roles: string[] }
//       const user = mockUsers.find((u) => u.id === Number(params.id))
//       if (user) user.roles = roles as RoleCode[]
//       return ok(null)
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/categories/tree',
//     handler: () => ok(mockCategoryTree),
//   },
//   {
//     method: 'POST',
//     pattern: 'admin/categories',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/categories/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'DELETE',
//     pattern: 'admin/categories/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/posts',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       let filtered = [...mockPosts]
//       if (query.keyword) {
//         const kw = query.keyword.toLowerCase()
//         filtered = filtered.filter((p) => p.title.toLowerCase().includes(kw))
//       }
//       if (query.categoryId) {
//         filtered = filtered.filter((p) => p.categoryId === Number(query.categoryId))
//       }
//       if (query.status !== undefined && query.status !== '') {
//         filtered = filtered.filter((p) => p.status === Number(query.status))
//       }
//       return ok(paginate(filtered, page, size))
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/posts/:id/top',
//     handler: (params, _q, body) => {
//       const { isTop } = body as { isTop: boolean }
//       const post = mockPosts.find((p) => p.id === Number(params.id))
//       if (post) post.isTop = isTop
//       return ok(null)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/posts/:id/essence',
//     handler: (params, _q, body) => {
//       const { isEssence } = body as { isEssence: boolean }
//       const post = mockPosts.find((p) => p.id === Number(params.id))
//       if (post) post.isEssence = isEssence
//       return ok(null)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/posts/:id/block',
//     handler: (params) => {
//       const post = mockPosts.find((p) => p.id === Number(params.id))
//       if (post) post.status = 3
//       return ok(null)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/posts/:id/move',
//     handler: () => ok(null),
//   },
//   {
//     method: 'DELETE',
//     pattern: 'admin/posts/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/reports',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       let filtered = [...mockReports]
//       if (query.status !== undefined && query.status !== '') {
//         filtered = filtered.filter((r) => r.status === Number(query.status))
//       }
//       if (query.targetType !== undefined && query.targetType !== '') {
//         filtered = filtered.filter((r) => r.targetType === Number(query.targetType))
//       }
//       return ok(paginate(filtered, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/reports/:id',
//     handler: (params) => {
//       const report = mockReports.find((r) => r.id === Number(params.id))
//       if (!report) return { data: { code: 404, message: '举报不存在', data: null } }
//       return ok(report)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/reports/:id/handle',
//     handler: (params, _q, body) => {
//       const { result, action } = body as { result: string; action: string }
//       const report = mockReports.find((r) => r.id === Number(params.id))
//       if (report) {
//         report.handleResult = result
//         report.handlerName = '管理员'
//         report.handleTime = new Date().toISOString()
//         if (action === 'block') report.status = 3
//         else if (action === 'ignore') report.status = 2
//         else if (action === 'warn') report.status = 4
//       }
//       return ok(null)
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/config',
//     handler: () => ok(mockSystemConfig),
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/config',
//     handler: (_p, _q, body) => {
//       const updates = body as Partial<AdminSystemConfig>
//       Object.assign(mockSystemConfig, updates)
//       return ok(null)
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/sensitive-words',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 20
//       let filtered = [...mockSensitiveWords]
//       if (query.keyword) {
//         const kw = query.keyword.toLowerCase()
//         filtered = filtered.filter((w) => w.word.toLowerCase().includes(kw))
//       }
//       return ok(paginate(filtered, page, size))
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'admin/sensitive-words',
//     handler: (_p, _q, body) => {
//       const { word } = body as { word: string }
//       mockSensitiveWords.push({ id: wordIdCounter++, word, createdAt: new Date().toISOString() })
//       return ok(null)
//     },
//   },
//   {
//     method: 'DELETE',
//     pattern: 'admin/sensitive-words/:id',
//     handler: (params) => {
//       const idx = mockSensitiveWords.findIndex((w) => w.id === Number(params.id))
//       if (idx > -1) mockSensitiveWords.splice(idx, 1)
//       return ok(null)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'admin/sensitive-words/batch',
//     handler: (_p, _q, body) => {
//       const { words } = body as { words: string[] }
//       words.forEach((word) => {
//         mockSensitiveWords.push({ id: wordIdCounter++, word, createdAt: new Date().toISOString() })
//       })
//       return ok({ imported: words.length })
//     },
//   },
// ]

// export function setupMockInterceptor(axiosInstance: ReturnType<typeof import('axios')['default']['create']>) {
//   axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//     const url = (config.url || '').replace(/^\/+/, '')
//     const method = (config.method || 'get').toUpperCase()

//     for (const entry of handlers) {
//       if (entry.method !== method) continue
//       const params = matchUrl(url, entry.pattern)
//       if (!params) continue

//       const urlQuery = getQueryParams(config.url || '')
//       const configParams: Record<string, string> = {}
//       if (config.params) {
//         Object.entries(config.params as Record<string, unknown>).forEach(([key, value]) => {
//           configParams[key] = String(value)
//         })
//       }
//       const query = { ...urlQuery, ...configParams }
//       const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}
//       const response = entry.handler(params, query, body)

//       const adapter = () =>
//         new Promise((resolve) => {
//           setTimeout(() => {
//             resolve({
//               data: response.data,
//               status: response.status || 200,
//               statusText: 'OK',
//               headers: { 'content-type': 'application/json' },
//               config,
//             })
//           }, response.delay ?? MOCK_DELAY)
//         })

//       config.adapter = adapter as unknown as InternalAxiosRequestConfig['adapter']
//       return config
//     }

//     return config
//   })
// }
