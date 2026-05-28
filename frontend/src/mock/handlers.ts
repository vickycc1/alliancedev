// import type { InternalAxiosRequestConfig } from 'axios'
// import type { Result, PageResult } from '@/types/common'
// import type { User, LoginResponse, UpdateProfileRequest } from '@/types/user'
// import type { PostResponse, PostListItem } from '@/types/post'
// import type { CommentWithUser } from '@/types/comment'
// import type { CategoryTree } from '@/types/category'
// import type { Notification, Report, AiResponse } from '@/types/interaction'
// import {
//   mockUsers,
//   mockCategories,
//   mockPosts,
//   mockPostDetail,
//   mockComments,
//   mockNotifications,
//   mockReports,
//   mockAiResponse,
//   mockDashboardStats,
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

// let currentUser: User = mockUsers[0]
// let postIdCounter = mockPosts.length + 1
// let commentIdCounter = 100

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
//       const user = mockUsers.find((u) => u.username === username)
//       if (!user || password !== '123456') {
//         return { data: { code: 401, message: '用户名或密码错误', data: null }, status: 401 }
//       }
//       currentUser = user
//       const loginRes: LoginResponse = {
//         token: 'mock_token_' + Date.now(),
//         refreshToken: 'mock_refresh_token_' + Date.now(),
//         expiresIn: 86400,
//         user,
//       }
//       return ok(loginRes)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'auth/register',
//     handler: (_p, _q, body) => {
//       const { username } = body as { username: string }
//       if (mockUsers.some((u) => u.username === username)) {
//         return { data: { code: 400, message: '用户名已存在', data: null } }
//       }
//       return ok(null)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'auth/refresh',
//     handler: () => {
//       return ok({
//         token: 'mock_token_refreshed_' + Date.now(),
//         refreshToken: 'mock_refresh_token_refreshed_' + Date.now(),
//         expiresIn: 86400,
//       })
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'auth/logout',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'auth/me',
//     handler: () => ok(currentUser),
//   },
//   {
//     method: 'GET',
//     pattern: 'auth/user/:id',
//     handler: (params) => {
//       const user = mockUsers.find((u) => u.id === Number(params.id))
//       if (!user) return { data: { code: 404, message: '用户不存在', data: null } }
//       return ok(user)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'user/profile',
//     handler: (_p, _q, body) => {
//       const updates = body as UpdateProfileRequest
//       currentUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() }
//       return ok(currentUser)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'user/password',
//     handler: (_p, _q, body) => {
//       const { oldPassword } = body as { oldPassword: string; newPassword: string }
//       if (oldPassword !== '123456') {
//         return { data: { code: 400, message: '当前密码错误', data: null } }
//       }
//       return ok(null)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'user/avatar',
//     handler: () => {
//       const url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
//       return ok({ url, avatar: url })
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'user/comments',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockComments, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'user/favorites',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockPosts.slice(0, 3), page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'categories/tree',
//     handler: () => ok(mockCategories),
//   },
//   {
//     method: 'GET',
//     pattern: 'categories/:id',
//     handler: (params) => {
//       const cat = mockCategories.flatMap((c) => [c, ...(c.children || [])]).find((c) => c.id === Number(params.id))
//       if (!cat) return { data: { code: 404, message: '板块不存在', data: null } }
//       return ok(cat)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'categories',
//     handler: () => ok(Date.now()),
//   },
//   {
//     method: 'PUT',
//     pattern: 'categories/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'DELETE',
//     pattern: 'categories/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'categories/:id/status',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'categories/:id/sort',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'posts',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       let filtered = [...mockPosts]
//       if (query.categoryId) {
//         const cid = Number(query.categoryId)
//         const childIds = mockCategories
//           .filter((c) => c.id === cid && c.children)
//           .flatMap((c) => c.children!.map((ch) => ch.id))
//         const matchIds = childIds.length > 0 ? [cid, ...childIds] : [cid]
//         filtered = filtered.filter((p) => matchIds.includes(p.categoryId))
//       }
//       if (query.authorId) {
//         filtered = filtered.filter((p) => p.author.id === Number(query.authorId))
//       }
//       if (query.isEssence === 'true') {
//         filtered = filtered.filter((p) => p.isEssence === 1)
//       }
//       if (query.keyword) {
//         const kw = query.keyword.toLowerCase()
//         filtered = filtered.filter(
//           (p) => p.title.toLowerCase().includes(kw) || (p.summary || '').toLowerCase().includes(kw),
//         )
//       }
//       if (query.sortBy === 'HOTTEST') {
//         filtered.sort((a, b) => b.viewCount - a.viewCount)
//       } else if (query.sortBy === 'MOST_COMMENTS') {
//         filtered.sort((a, b) => b.commentCount - a.commentCount)
//       } else {
//         filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//       }
//       return ok(paginate(filtered, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'posts/:id',
//     handler: (params) => {
//       if (Number(params.id) === 1) return ok(mockPostDetail)
//       const listItem = mockPosts.find((p) => p.id === Number(params.id))
//       if (!listItem) return { data: { code: 404, message: '文章不存在', data: null } }
//       const detail: PostResponse = {
//         id: listItem.id,
//         categoryId: listItem.categoryId,
//         categoryName: listItem.categoryName,
//         author: {
//           id: listItem.author.id,
//           username: listItem.author.username,
//           nickname: listItem.author.nickname,
//           avatar: listItem.author.avatar,
//           bio: listItem.author.bio,
//           status: listItem.author.status,
//           roles: [],
//           createdAt: '',
//           updatedAt: '',
//         },
//         title: listItem.title,
//         content: `# ${listItem.title}\n\n这是文章的详细内容...`,
//         summary: listItem.summary,
//         viewCount: listItem.viewCount,
//         likeCount: listItem.likeCount,
//         commentCount: listItem.commentCount,
//         favoriteCount: listItem.favoriteCount,
//         shareCount: 0,
//         isTop: listItem.isTop,
//         isEssence: listItem.isEssence,
//         aiRequested: listItem.aiRequested,
//         status: listItem.status,
//         liked: false,
//         favorited: false,
//         createdAt: listItem.createdAt,
//         updatedAt: listItem.createdAt,
//       }
//       return ok(detail)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'posts',
//     handler: (_p, _q, body) => {
//       const { title, categoryId, content, aiRequested } = body as { title: string; categoryId: number; content: string; aiRequested: boolean }
//       const newId = postIdCounter++
//       return ok(newId)
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'posts/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'DELETE',
//     pattern: 'posts/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'posts/:id/top',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'posts/:id/essence',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'comments/post/:postId',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 20
//       return ok(paginate(mockComments, page, size))
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'comments',
//     handler: (_p, _q, body) => {
//       const { content, postId, parentId, replyToUserId } = body as { content: string; postId: number; parentId?: number; replyToUserId?: number }
//       const newId = commentIdCounter++
//       return ok(newId)
//     },
//   },
//   {
//     method: 'DELETE',
//     pattern: 'comments/:id',
//     handler: () => ok(null),
//   },
//   {
//     method: 'POST',
//     pattern: 'interaction/like',
//     handler: () => ok(Math.random() > 0.5),
//   },
//   {
//     method: 'POST',
//     pattern: 'interaction/favorite',
//     handler: () => ok(Math.random() > 0.5),
//   },
//   {
//     method: 'POST',
//     pattern: 'interaction/share',
//     handler: () => ok(null),
//   },
//   {
//     method: 'POST',
//     pattern: 'interaction/report',
//     handler: () => ok(Date.now()),
//   },
//   {
//     method: 'GET',
//     pattern: 'interaction/liked',
//     handler: () => ok(true),
//   },
//   {
//     method: 'GET',
//     pattern: 'interaction/favorited',
//     handler: () => ok(false),
//   },
//   {
//     method: 'GET',
//     pattern: 'notifications/unread-count',
//     handler: () => ok(mockNotifications.filter((n) => n.isRead === 0).length),
//   },
//   {
//     method: 'GET',
//     pattern: 'notifications',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 20
//       return ok(paginate(mockNotifications, page, size))
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'notifications/:id/read',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'notifications/read-all',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/dashboard',
//     handler: () => ok(mockDashboardStats),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/users',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockUsers, page, size))
//     },
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/users/:id/status',
//     handler: () => ok(null),
//   },
//   {
//     method: 'PUT',
//     pattern: 'admin/users/:id/roles',
//     handler: () => ok(null),
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/posts',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockPosts, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/comments',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockComments, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'admin/reports',
//     handler: (_p, query) => {
//       const page = Number(query.page) || 1
//       const size = Number(query.size) || 10
//       return ok(paginate(mockReports, page, size))
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'ai/posts/:id/response',
//     handler: (params) => {
//       if (Number(params.id) === 1) return ok(mockAiResponse)
//       return ok({
//         ...mockAiResponse,
//         id: Date.now(),
//         postId: Number(params.id),
//       })
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'ai/posts/:id/retry',
//     handler: (params) => {
//       const regenerated: AiResponse = {
//         ...mockAiResponse,
//         id: Date.now(),
//         postId: Number(params.id),
//         content: '这是重新生成的 AI 回答内容。基于帖子内容的深度分析，以下是核心要点总结和补充说明...',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       }
//       return ok(regenerated, 1000)
//     },
//   },
//   {
//     method: 'POST',
//     pattern: 'upload/image',
//     handler: () => {
//       return ok({ url: 'https://api.dicebear.com/7.x/shapes/svg?seed=' + Date.now() })
//     },
//   },
//   {
//     method: 'GET',
//     pattern: 'search/hot-keywords',
//     handler: () => {
//       return ok([
//         'Spring Boot',
//         'React 18',
//         '微服务',
//         'Docker',
//         'TypeScript',
//         'Redis',
//         'Kubernetes',
//         'Go并发',
//       ])
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
