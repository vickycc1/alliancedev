// import {
//   UserStatus,
//   RoleCode,
//   PostStatus,
//   CategoryStatus,
//   ReportStatus,
//   TargetType,
// } from '@/types/common'
// import type { User } from '@/types/user'
// import type { AdminStats, CategoryTreeNode, PostListItem, ReportListItem, SensitiveWord, AdminSystemConfig } from '@/types/admin'

// const now = new Date().toISOString()
// const dayAgo = new Date(Date.now() - 86400000).toISOString()
// const twoDaysAgo = new Date(Date.now() - 172800000).toISOString()
// const weekAgo = new Date(Date.now() - 604800000).toISOString()
// const monthAgo = new Date(Date.now() - 2592000000).toISOString()

// export const mockAdminUser: User = {
//   id: 1,
//   username: 'admin',
//   nickname: '超级管理员',
//   avatar: '',
//   email: 'admin@techcommunity.com',
//   phone: '13800000001',
//   bio: '系统管理员',
//   status: UserStatus.NORMAL,
//   roles: [RoleCode.ADMIN, RoleCode.USER],
//   createdAt: weekAgo,
//   updatedAt: now,
//   lastLoginAt: now,
// }

// export const mockUsers: User[] = [
//   mockAdminUser,
//   {
//     id: 2,
//     username: 'moderator',
//     nickname: '版主张三',
//     avatar: '',
//     email: 'zhangsan@techcommunity.com',
//     phone: '13800000002',
//     bio: '技术版主，热爱分享',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.MODERATOR, RoleCode.USER],
//     createdAt: weekAgo,
//     updatedAt: dayAgo,
//     lastLoginAt: dayAgo,
//   },
//   {
//     id: 3,
//     username: 'developer',
//     nickname: '开发者李四',
//     avatar: '',
//     email: 'lisi@techcommunity.com',
//     phone: '13800000003',
//     bio: '全栈开发者，Java / React 双修',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.USER],
//     createdAt: weekAgo,
//     updatedAt: weekAgo,
//     lastLoginAt: dayAgo,
//   },
//   {
//     id: 4,
//     username: 'newbie',
//     nickname: '新手王五',
//     avatar: '',
//     email: 'wangwu@techcommunity.com',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.USER],
//     createdAt: dayAgo,
//     updatedAt: dayAgo,
//     lastLoginAt: dayAgo,
//   },
//   {
//     id: 5,
//     username: 'muted_user',
//     nickname: '被禁言用户',
//     avatar: '',
//     email: 'muted@techcommunity.com',
//     status: UserStatus.MUTED,
//     roles: [RoleCode.USER],
//     createdAt: weekAgo,
//     updatedAt: now,
//   },
//   {
//     id: 6,
//     username: 'disabled_user',
//     nickname: '已禁用用户',
//     avatar: '',
//     email: 'disabled@techcommunity.com',
//     status: UserStatus.DISABLED,
//     roles: [RoleCode.USER],
//     createdAt: monthAgo,
//     updatedAt: weekAgo,
//   },
//   {
//     id: 7,
//     username: 'frontend_dev',
//     nickname: '前端工程师赵六',
//     avatar: '',
//     email: 'zhaoliu@techcommunity.com',
//     phone: '13800000007',
//     bio: 'React / Vue / TypeScript',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.USER],
//     createdAt: twoDaysAgo,
//     updatedAt: dayAgo,
//     lastLoginAt: dayAgo,
//   },
//   {
//     id: 8,
//     username: 'backend_dev',
//     nickname: '后端工程师孙七',
//     avatar: '',
//     email: 'sunqi@techcommunity.com',
//     phone: '13800000008',
//     bio: 'Spring Boot / MyBatis / Redis',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.USER],
//     createdAt: twoDaysAgo,
//     updatedAt: dayAgo,
//     lastLoginAt: dayAgo,
//   },
//   {
//     id: 9,
//     username: 'devops',
//     nickname: '运维工程师周八',
//     avatar: '',
//     email: 'zhouba@techcommunity.com',
//     phone: '13800000009',
//     bio: 'Docker / K8s / CI/CD',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.MODERATOR, RoleCode.USER],
//     createdAt: weekAgo,
//     updatedAt: twoDaysAgo,
//     lastLoginAt: twoDaysAgo,
//   },
//   {
//     id: 10,
//     username: 'ai_researcher',
//     nickname: 'AI研究员吴九',
//     avatar: '',
//     email: 'wujiu@techcommunity.com',
//     phone: '13800000010',
//     bio: 'NLP / LLM / RAG',
//     status: UserStatus.NORMAL,
//     roles: [RoleCode.USER],
//     createdAt: dayAgo,
//     updatedAt: dayAgo,
//     lastLoginAt: now,
//   },
// ]

// export const mockCategoryTree: CategoryTreeNode[] = [
//   {
//     id: 1, name: '后端开发', parentId: 0, icon: 'ServerOutlined',
//     description: '后端技术讨论', sortOrder: 1, status: CategoryStatus.ENABLED, postCount: 25,
//     children: [
//       { id: 2, name: 'Java', parentId: 1, icon: '', description: 'Java 相关技术', sortOrder: 1, status: CategoryStatus.ENABLED, postCount: 12 },
//       { id: 3, name: 'Go', parentId: 1, icon: '', description: 'Go 语言技术', sortOrder: 2, status: CategoryStatus.ENABLED, postCount: 8 },
//       { id: 4, name: 'Python', parentId: 1, icon: '', description: 'Python 相关技术', sortOrder: 3, status: CategoryStatus.ENABLED, postCount: 5 },
//     ],
//   },
//   {
//     id: 5, name: '前端开发', parentId: 0, icon: 'CodeOutlined',
//     description: '前端技术讨论', sortOrder: 2, status: CategoryStatus.ENABLED, postCount: 18,
//     children: [
//       { id: 6, name: 'React', parentId: 5, icon: '', description: 'React 相关技术', sortOrder: 1, status: CategoryStatus.ENABLED, postCount: 10 },
//       { id: 7, name: 'Vue', parentId: 5, icon: '', description: 'Vue 相关技术', sortOrder: 2, status: CategoryStatus.ENABLED, postCount: 8 },
//     ],
//   },
//   {
//     id: 8, name: 'DevOps', parentId: 0, icon: 'CloudOutlined',
//     description: '运维与部署', sortOrder: 3, status: CategoryStatus.ENABLED, postCount: 6,
//   },
//   {
//     id: 9, name: 'AI & 机器学习', parentId: 0, icon: 'RobotOutlined',
//     description: '人工智能与机器学习', sortOrder: 4, status: CategoryStatus.ENABLED, postCount: 9,
//   },
//   {
//     id: 10, name: '数据库', parentId: 0, icon: 'DatabaseOutlined',
//     description: '数据库技术', sortOrder: 5, status: CategoryStatus.ENABLED, postCount: 7,
//     children: [
//       { id: 11, name: 'MySQL', parentId: 10, icon: '', description: 'MySQL 相关', sortOrder: 1, status: CategoryStatus.ENABLED, postCount: 4 },
//       { id: 12, name: 'Redis', parentId: 10, icon: '', description: 'Redis 相关', sortOrder: 2, status: CategoryStatus.ENABLED, postCount: 3 },
//     ],
//   },
//   {
//     id: 13, name: '架构设计', parentId: 0, icon: 'ApartmentOutlined',
//     description: '系统架构与设计模式', sortOrder: 6, status: CategoryStatus.DISABLED, postCount: 2,
//   },
// ]

// export const mockPosts: PostListItem[] = [
//   {
//     id: 1, title: 'Spring Boot 3.2 新特性全面解析', authorId: 3, authorName: '开发者李四', authorAvatar: '',
//     categoryId: 2, categoryName: 'Java', status: PostStatus.NORMAL, isTop: true, isEssence: true,
//     viewCount: 1520, likeCount: 89, commentCount: 23, createdAt: dayAgo, updatedAt: dayAgo,
//   },
//   {
//     id: 2, title: 'React 18 并发模式深度实践', authorId: 7, authorName: '前端工程师赵六', authorAvatar: '',
//     categoryId: 6, categoryName: 'React', status: PostStatus.NORMAL, isTop: false, isEssence: true,
//     viewCount: 980, likeCount: 56, commentCount: 15, createdAt: dayAgo, updatedAt: dayAgo,
//   },
//   {
//     id: 3, title: 'Go 语言并发模型：Goroutine 与 Channel 最佳实践', authorId: 3, authorName: '开发者李四', authorAvatar: '',
//     categoryId: 3, categoryName: 'Go', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 670, likeCount: 34, commentCount: 8, createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
//   },
//   {
//     id: 4, title: 'Docker Compose 多容器编排实战', authorId: 9, authorName: '运维工程师周八', authorAvatar: '',
//     categoryId: 8, categoryName: 'DevOps', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 430, likeCount: 21, commentCount: 6, createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
//   },
//   {
//     id: 5, title: 'TypeScript 5.x 类型体操进阶指南', authorId: 7, authorName: '前端工程师赵六', authorAvatar: '',
//     categoryId: 6, categoryName: 'React', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 320, likeCount: 18, commentCount: 4, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 6, title: 'Redis 分布式锁实现方案对比', authorId: 8, authorName: '后端工程师孙七', authorAvatar: '',
//     categoryId: 12, categoryName: 'Redis', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 560, likeCount: 29, commentCount: 11, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 7, title: 'RAG 检索增强生成技术详解', authorId: 10, authorName: 'AI研究员吴九', authorAvatar: '',
//     categoryId: 9, categoryName: 'AI & 机器学习', status: PostStatus.NORMAL, isTop: false, isEssence: true,
//     viewCount: 890, likeCount: 67, commentCount: 19, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 8, title: 'Vue 3 Composition API 迁移经验总结', authorId: 7, authorName: '前端工程师赵六', authorAvatar: '',
//     categoryId: 7, categoryName: 'Vue', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 280, likeCount: 15, commentCount: 5, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 9, title: 'MySQL 索引优化实战案例', authorId: 8, authorName: '后端工程师孙七', authorAvatar: '',
//     categoryId: 11, categoryName: 'MySQL', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 410, likeCount: 22, commentCount: 7, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 10, title: 'Kubernetes 集群监控方案选型', authorId: 9, authorName: '运维工程师周八', authorAvatar: '',
//     categoryId: 8, categoryName: 'DevOps', status: PostStatus.NORMAL, isTop: false, isEssence: false,
//     viewCount: 350, likeCount: 19, commentCount: 9, createdAt: weekAgo, updatedAt: weekAgo,
//   },
//   {
//     id: 11, title: '违规广告帖 - 已屏蔽', authorId: 5, authorName: '被禁言用户', authorAvatar: '',
//     categoryId: 2, categoryName: 'Java', status: PostStatus.BLOCKED, isTop: false, isEssence: false,
//     viewCount: 10, likeCount: 0, commentCount: 0, createdAt: twoDaysAgo, updatedAt: twoDaysAgo,
//   },
//   {
//     id: 12, title: '草稿 - 微服务网关设计', authorId: 3, authorName: '开发者李四', authorAvatar: '',
//     categoryId: 1, categoryName: '后端开发', status: PostStatus.DRAFT, isTop: false, isEssence: false,
//     viewCount: 0, likeCount: 0, commentCount: 0, createdAt: dayAgo, updatedAt: dayAgo,
//   },
// ]

// export const mockReports: ReportListItem[] = [
//   {
//     id: 1, reporterId: 3, reporterName: '开发者李四',
//     targetType: TargetType.POST, targetId: 11, targetTitle: '违规广告帖 - 已屏蔽',
//     targetContent: '这是违规广告内容，包含垃圾链接...',
//     reason: '垃圾广告', status: ReportStatus.PENDING, createdAt: dayAgo,
//   },
//   {
//     id: 2, reporterId: 7, reporterName: '前端工程师赵六',
//     targetType: TargetType.POST, targetId: 5, targetTitle: 'TypeScript 5.x 类型体操进阶指南',
//     targetContent: '帖子内容中包含抄袭段落...',
//     reason: '涉嫌抄袭', status: ReportStatus.PENDING, createdAt: twoDaysAgo,
//   },
//   {
//     id: 3, reporterId: 4, reporterName: '新手王五',
//     targetType: TargetType.COMMENT, targetId: 42, targetTitle: 'Spring Boot 3.2 新特性全面解析',
//     targetContent: '评论内容包含人身攻击言论...',
//     reason: '人身攻击', status: ReportStatus.WARNED,
//     handlerName: '管理员', handleResult: '已警告用户', handleTime: dayAgo, createdAt: twoDaysAgo,
//   },
//   {
//     id: 4, reporterId: 8, reporterName: '后端工程师孙七',
//     targetType: TargetType.POST, targetId: 6, targetTitle: 'Redis 分布式锁实现方案对比',
//     targetContent: '帖子内容包含敏感信息...',
//     reason: '敏感信息', status: ReportStatus.IGNORED,
//     handlerName: '管理员', handleResult: '经核实不构成违规', handleTime: weekAgo, createdAt: weekAgo,
//   },
//   {
//     id: 5, reporterId: 9, reporterName: '运维工程师周八',
//     targetType: TargetType.COMMENT, targetId: 78, targetTitle: 'Docker Compose 多容器编排实战',
//     targetContent: '恶意刷屏评论...',
//     reason: '恶意刷屏', status: ReportStatus.BLOCKED,
//     handlerName: '管理员', handleResult: '已屏蔽评论', handleTime: twoDaysAgo, createdAt: twoDaysAgo,
//   },
//   {
//     id: 6, reporterId: 10, reporterName: 'AI研究员吴九',
//     targetType: TargetType.POST, targetId: 7, targetTitle: 'RAG 检索增强生成技术详解',
//     targetContent: '帖子内容存在误导性描述...',
//     reason: '误导性内容', status: ReportStatus.PENDING, createdAt: dayAgo,
//   },
// ]

// export const mockStats: AdminStats = {
//   userTotal: 1024,
//   userTodayNew: 12,
//   postTotal: 3856,
//   postTodayNew: 28,
//   commentTotal: 12450,
//   commentTodayNew: 67,
//   reportPending: 3,
//   aiCallCount: 892,
//   aiSuccessRate: 94.5,
//   activeTrend: [
//     { date: '05-09', users: 156, posts: 22 },
//     { date: '05-10', users: 189, posts: 31 },
//     { date: '05-11', users: 201, posts: 28 },
//     { date: '05-12', users: 178, posts: 19 },
//     { date: '05-13', users: 223, posts: 35 },
//     { date: '05-14', users: 245, posts: 42 },
//     { date: '05-15', users: 267, posts: 28 },
//   ],
// }

// export const mockSensitiveWords: SensitiveWord[] = [
//   { id: 1, word: '赌博', createdAt: weekAgo },
//   { id: 2, word: '色情', createdAt: weekAgo },
//   { id: 3, word: '暴力', createdAt: weekAgo },
//   { id: 4, word: '诈骗', createdAt: twoDaysAgo },
//   { id: 5, word: '传销', createdAt: twoDaysAgo },
//   { id: 6, word: '代购', createdAt: dayAgo },
//   { id: 7, word: '刷单', createdAt: dayAgo },
//   { id: 8, word: '私聊转账', createdAt: dayAgo },
// ]

// export const mockSystemConfig: AdminSystemConfig = {
//   aiBaseUrl: 'https://api.openai.com/v1',
//   aiApiKey: 'sk-****************************',
//   aiModel: 'gpt-4o-mini',
//   aiTemperature: 0.7,
//   aiMaxTokens: 2048,
//   casServerUrl: 'https://cas.example.com/cas',
//   casCallbackUrl: 'http://localhost:3000/api/auth/cas/callback',
//   postRateLimit: 10,
//   commentRateLimit: 30,
//   notificationRetentionDays: 30,
// }
