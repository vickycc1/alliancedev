# TechCommunity — 技术交流社区平台 演示材料

## 一、项目概述

**TechCommunity** 是一个面向技术从业者的企业级交流分享社区平台，支持帖子发布与讨论、评论互动、内容审核、AI 辅助回答、管理后台等完整功能链路。

| 维度 | 说明 |
|------|------|
| 项目定位 | 企业级技术交流社区 |
| 系统架构 | 前后端分离 — Spring Boot + React 双端 |
| 后端技术栈 | Spring Boot 3.2 / Spring Security / MyBatis-Plus / MySQL / Redis / JWT |
| 前端技术栈 | React 18 / TypeScript / Ant Design / Zustand / Vite |
| 管理后台 | React 18 / Ant Design / @ant-design/charts |
| 代码规模 | 后端 80+ Java 文件 / 前端 55+ TSX 文件 / 管理后台 20+ TSX 文件 |
| 接口数量 | 30+ RESTful API 端点 |
| 数据库表 | 14 张业务表（用户、帖子、评论、板块、互动、举报、通知、敏感词等） |

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  前台 (React) │  │ 管理后台(React)│  │  移动端(预留)  │  │
│  │  :3000       │  │  :3001        │  │               │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
│         │ Vite Proxy      │ Vite Proxy                   │
└─────────┼─────────────────┼──────────────────────────────┘
          │ /api            │ /api
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                 Spring Boot 3.2 (:8080)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Auth模块   │ │帖子/评论  │ │互动模块   │ │管理后台模块 │  │
│  │JWT+RBAC  │ │内容过滤   │ │点赞/收藏  │ │统计/审核   │  │
│  │登录锁定   │ │XSS清洗   │ │举报/分享  │ │敏感词管理  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │通知模块   │ │AI模块    │ │搜索模块   │                │
│  │WebSocket │ │AI回答    │ │全文检索   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │  MySQL  │ │  Redis  │ │ 本地存储 │
    │  数据库  │ │ 缓存/限流│ │ 文件上传 │
    └─────────┘ └─────────┘ └─────────┘
```

---

## 三、核心功能展示

### 3.1 用户体系

| 功能 | 说明 |
|------|------|
| 注册/登录 | 用户名+密码注册，BCrypt 加密存储 |
| JWT 认证 | 无状态 Token 认证，支持 Token 刷新 |
| 登录安全 | 连续5次失败锁定30分钟，自动解锁 |
| CAS 单点登录 | 对接企业 CAS 认证中心 |
| 角色权限 | ADMIN / MODERATOR / USER 三级 RBAC |
| 个人资料 | 头像上传、信息编辑、密码修改 |

### 3.2 内容管理

| 功能 | 说明 |
|------|------|
| 帖子发布 | 支持 Markdown/富文本编辑，选择板块发布 |
| 帖子操作 | 置顶、加精、屏蔽、删除、移动板块 |
| 评论系统 | 多级嵌套评论，支持回复指定用户 |
| 板块管理 | 树形结构，支持启用/禁用、排序 |
| AI 辅助回答 | 发帖时可请求 AI 自动生成技术解答 |

### 3.3 互动体系

| 功能 | 说明 |
|------|------|
| 点赞 | 帖子/评论点赞切换 |
| 收藏 | 帖子收藏，收藏列表查看 |
| 分享 | 分享到微信/微博/QQ，记录分享数据 |
| 举报 | 帖子/评论举报，7种原因可选 |
| 通知 | 系统通知、互动通知，WebSocket 实时推送 |

### 3.4 管理后台

| 功能 | 说明 |
|------|------|
| 系统概览 | 用户/帖子/评论统计，趋势图展示 |
| 用户管理 | 用户列表、状态切换、角色分配 |
| 帖子管理 | 帖子列表、置顶/加精/屏蔽/删除/移动 |
| 板块管理 | 树形板块 CRUD、启用/禁用、排序 |
| 举报管理 | 举报列表、处理（屏蔽/警告/忽略） |
| 敏感词管理 | 添加/删除/批量导入，实时生效 |
| 系统配置 | AI 开关、CAS 配置等 |

---

## 四、技术难点与解决方案

### 难点一：敏感词过滤 — 实时检测与动态更新

**挑战**：
- 敏感词库存储在数据库中，但每次发布内容都查询数据库会导致性能瓶颈
- 管理后台增删敏感词后，内存缓存需实时同步
- 需支持大小写不敏感匹配，数据库中敏感词可能含前后空格

**解决方案**：

采用「首字符分组 + 全量集合」双索引内存缓存架构：

```
应用启动 (@PostConstruct)
    ↓
loadSensitiveWords() → 从数据库全量加载
    ↓
sensitiveWordMap: Map<Character, Set<String>>  ← 按首字符分组，O(1) 定位候选词
allSensitiveWords: Set<String>                ← 全量集合，用于替换
    ↓
管理后台增删敏感词 → refreshSensitiveWords() → 清空+重新加载
```

| 技术要点 | 实现方式 |
|----------|----------|
| 内存缓存 | `@PostConstruct` 启动加载，避免每次请求查库 |
| 大小写不敏感 | 加载时 `trim().toLowerCase()`，匹配时 `content.toLowerCase()` |
| 动态刷新 | AdminController 增删改后调用 `refreshSensitiveWords()` |
| 双索引 | 检测用首字符分组（快速定位），替换用全量集合（精确替换） |
| 安全拦截 | 检测到敏感词抛出 `CONTENT_SENSITIVE(5001)`，前端提示"内容包含违规信息" |

**效果**：百级敏感词规模下，单次检测耗时 < 1ms，管理后台操作后敏感词即时生效。

---

### 难点二：XSS 防护 — 富文本安全与格式保留的平衡

**挑战**：
- 帖子内容支持富文本 HTML，必须防止 XSS 攻击
- 过于激进的清洗会破坏合法格式（如表格、代码块）
- 需处理多种 XSS 注入方式：script 标签、事件处理器、javascript 协议、CSS 表达式等

**解决方案**：

采用「黑名单移除 + 危险属性替换」策略，在 `cleanHtml()` 中依次处理 7 类攻击向量：

```java
SCRIPT_PATTERN     → 移除 <script> 标签
IFRAME_PATTERN     → 移除 <iframe> 标签
OBJECT_PATTERN     → 移除 <object> 标签
EMBED_PATTERN      → 移除 <embed> 标签
EVENT_HANDLER_PATTERN → onXxx= 替换为 data-blocked=
JAVASCRIPT_PATTERN   → javascript: 替换为 blocked:
EXPRESSION_PATTERN   → expression() 替换为 blocked(
```

**调用链**：`发布内容 → cleanHtml(XSS清洗) → containsSensitiveWord(敏感词检测) → 保存`

**扩展性**：已定义 `ALLOWED_TAGS` 白名单集合（含 p, table, code 等 26 个标签），预留后续升级为白名单过滤的空间。

---

### 难点三：前后端联调 — 30+ 接口的类型对齐

**挑战**：
- 前端 Mock 数据与后端实际接口存在路径、请求体、响应体三重不匹配
- 后端返回 `Result<Long>`（仅 ID），前端期望完整对象
- 枚举类型差异：后端 `List<String>` roleCodes vs 前端 `RoleCode[]`
- 分页参数、排序方式、空值处理等细节差异

**解决方案**：

1. **路径对齐**：逐一比对前端 API 调用与后端 Controller，修正 10+ 处路径错误
2. **乐观更新**：评论/点赞等操作，前端构造临时对象立即更新 UI，后端仅返回 ID
3. **类型适配**：`updateUserRoles` 参数从 `number[]` 改为 `string[]`，与后端 `List<String>` roleCodes 对齐
4. **代理配置**：Vite 配置 `/api` 代理到后端 8080 端口，`/uploads` 代理解决文件访问跨域

**修复的关键不匹配项**：

| 问题 | 修复 |
|------|------|
| `GET /categories` → 后端无此接口 | 改为 `GET /categories/tree` |
| `GET /user/profile` → 后端无此接口 | 改为 `GET /auth/me` |
| `POST /posts/{id}/comments` | 改为 `POST /comments`（body 含 postId） |
| `GET /posts/{id}/comments` | 改为 `GET /comments/post/{id}` |
| 后端返回 `Result<Long>` | 前端用返回 ID 构造乐观对象 |

---

### 难点四：登录安全 — 暴力破解防护与用户体验

**挑战**：
- 需防止暴力破解，但不能影响正常用户登录
- 锁定后需自动解锁，避免管理员手动干预
- 并发登录请求可能导致计数不准确

**解决方案**：

基于数据库字段 `login_fail_count` + `locked_until` 的锁定机制：

```
登录请求
    ↓
检查 locked_until → 未过期 → 拒绝登录（提示剩余锁定时间）
    ↓ 已过期/未锁定
验证密码
    ├─ 成功 → 重置 login_fail_count=0, 清除 locked_until
    └─ 失败 → login_fail_count++
              ↓
         count >= 5 → 设置 locked_until = now + 30min
              ↓
         返回错误提示（剩余尝试次数）
```

| 参数 | 值 |
|------|-----|
| 最大失败次数 | 5 次 |
| 锁定时长 | 30 分钟 |
| 自动解锁 | `locked_until` 过期后自动清零 |
| 密码加密 | BCrypt（强度因子 10） |

---

### 难点五：接口限流 — 基于 Redis 的分布式频率控制

**挑战**：
- 发帖、评论等操作需限制频率，防止恶意刷屏
- 限流需基于用户维度，不同用户独立计数
- 需支持自定义限流阈值和时间窗口

**解决方案**：

基于 AOP + Redis 的声明式限流框架：

```java
@RateLimit(limit = 5, period = 60)  // 60秒内最多5次
@PostMapping
public Long createPost(...) { ... }
```

**实现原理**：
1. `@RateLimit` 注解标注在 Controller 方法上
2. `RateLimitAspect` 切面拦截，以 `rate_limit:{userId}:{method}` 为 Redis Key
3. `INCR` 原子递增计数，首次设置过期时间
4. 超限抛出 `RATE_LIMITED(429)` 异常

---

### 难点六：Spring Security 角色前缀与权限配置

**挑战**：
- Spring Security 默认添加 `ROLE_` 前缀，导致 `hasRole('ADMIN')` 实际匹配 `ROLE_ADMIN`
- 数据库存储的角色代码（`ADMIN`）与 Spring Security 期望的角色名需对齐
- JWT Token 中的角色信息需与 `@PreAuthorize` 注解一致
- 管理后台接口 403 错误排查困难

**解决方案**：

1. `UserDetailsServiceImpl` 加载用户时，将角色代码直接作为 GrantedAuthority
2. `JwtTokenProvider` 生成 Token 时包含角色列表
3. `JwtAuthenticationFilter` 解析 Token 时重建 Authentication 对象
4. `SecurityConfig` 配置 URL 级权限：`/admin/**` 要求 `hasRole('ADMIN')`
5. 方法级权限：`@PreAuthorize("hasRole('ADMIN')")` 保护管理接口

---

## 五、成果价值

### 5.1 技术成果

| 成果 | 量化指标 |
|------|----------|
| 完整的前后端分离架构 | 3 个独立项目（frontend / admin / backend），30+ API 接口 |
| 企业级安全体系 | JWT 认证 + RBAC 权限 + 登录锁定 + XSS 防护 + 敏感词过滤 + 接口限流 |
| 内容审核闭环 | 敏感词实时过滤 → 用户举报 → 管理员审核 → 处理反馈 |
| 高质量代码 | 0 个 TypeScript 编译错误，0 个构建警告 |
| 完善的错误处理 | 40+ 业务错误码，统一异常处理，前端友好提示 |

### 5.2 业务价值

| 价值维度 | 说明 |
|----------|------|
| 内容安全 | 敏感词过滤 + XSS 防护 + 举报机制，三重保障平台内容合规 |
| 运营效率 | 管理后台一站式管理用户/帖子/板块/举报/敏感词，减少人工操作 |
| 用户体验 | 乐观更新、实时通知、AI 辅助回答，提升用户参与度 |
| 系统稳定 | 登录锁定 + 接口限流 + 异常兜底，保障系统可用性 |
| 可扩展性 | 模块化设计，预留 CAS 登录、AI 服务、WebSocket 通知等扩展点 |

### 5.3 工程实践

| 实践 | 说明 |
|------|------|
| PRD 驱动开发 | 严格按 PRD TODOQ 清单逐项实现，用户验收后标记完成 |
| 关键决策记录 | 7 条 ADR 文档，记录技术选型理由和替代方案 |
| API 接口文档 | 完整的接口文档，含请求/响应格式、错误码、认证方式 |
| 类型安全 | 前后端类型对齐，TypeScript 严格模式零错误 |
| 构建验证 | 三个项目均通过 `tsc -b && vite build` / `mvn package` 构建验证 |

---

## 六、技术栈全景

```
┌─────────────────────────────────────────────────────┐
│                      后端                            │
│  Spring Boot 3.2.5    Spring Security 6             │
│  MyBatis-Plus 3.5.6   MySQL (HikariCP)              │
│  Spring Data Redis    JWT (jjwt 0.12.5)             │
│  Spring WebSocket     Spring AOP                    │
│  BCrypt               CAS Client 3.6.4             │
│  Lombok               Hutool 5.8.26                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    前端 (Frontend)                    │
│  React 18.3           TypeScript 5.5                │
│  Ant Design 5.20      Zustand 4.5                   │
│  Axios 1.7             React Router 6.26            │
│  @uiw/react-md-editor  react-quill 2.0              │
│  @stomp/stompjs 7.0    Vite 5.4                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   管理后台 (Admin)                    │
│  React 18.3           TypeScript 5.5                │
│  Ant Design 5.20      @ant-design/charts 2.2        │
│  Zustand 4.5           Axios 1.7                     │
│  React Router 6.26     Vite 5.4                     │
└─────────────────────────────────────────────────────┘
```

---

## 七、项目结构

```
alliancedev/
├── backend/                    # Spring Boot 后端
│   └── src/main/java/com/techcommunity/
│       ├── controller/          # 8 个 Controller（Auth/Post/Comment/Category/Interaction/Admin/Notification/AI/Search）
│       ├── service/             # 7 个 Service 接口 + 7 个实现
│       ├── mapper/              # 13 个 MyBatis-Plus Mapper
│       ├── entity/              # 13 个实体类
│       ├── dto/                 # Request/Response DTO
│       ├── config/              # 8 个配置类（Security/CORS/Redis/JWT/File/WebSocket/Async/AI）
│       ├── security/            # JWT 过滤器 + Token 提供者 + SecurityUtils
│       ├── annotation/          # @RateLimit 自定义注解
│       ├── aspect/              # RateLimitAspect 限流切面
│       ├── exception/           # 全局异常处理 + BusinessException
│       └── common/              # Result/PageResult/ErrorCode/Constants
│
├── frontend/                   # React 前台
│   └── src/
│       ├── pages/               # 15 个页面（Home/Post/Login/Register/Profile/NewPost/EditPost/Category/Hot/Essence/Favorites/Search/Notifications/Admin...）
│       ├── components/          # 12 个组件（CommentList/CommentInput/PostCard/RichEditor/LikeButton/FavoriteButton/ShareButton/AIReplyCard/NotificationBell...）
│       ├── store/               # Zustand 状态管理（useAuthStore/useNotificationStore）
│       ├── api/                 # Axios 封装 + API 调用
│       ├── types/               # TypeScript 类型定义
│       ├── hooks/               # useWebSocket
│       └── router/              # 路由配置 + 路由守卫
│
├── admin/                      # React 管理后台
│   └── src/
│       ├── pages/               # 7 个页面（Dashboard/UserManage/PostManage/CategoryManage/ReportManage/SensitiveWordManage/SystemConfig）
│       ├── components/          # AdminLayout
│       ├── api/                 # admin.ts API 调用
│       ├── store/               # useAuthStore
│       └── types/               # 类型定义
│
└── docs/                       # 项目文档
    ├── api-interfaces.md        # API 接口文档
    └── key-decisions.md         # 关键决策记录（7 条 ADR）
```
