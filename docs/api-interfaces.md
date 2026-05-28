# TechCommunity API 接口文档

> 基础路径: `/api` | 服务端口: `8080` | 认证方式: Bearer Token (JWT)

---

## 通用结构

### 响应格式

```typescript
interface Result<T> {
  code: number      // 200=成功, 其他=失败
  message: string   // 提示信息
  data: T           // 业务数据
}
```

### 分页响应

```typescript
interface PageResult<T> {
  list: T[]         // 数据列表
  total: number     // 总条数
  page: number      // 当前页码
  size: number      // 每页条数
}
```

### 认证方式

除标记为「公开」的接口外，所有请求需在 Header 中携带：
```
Authorization: Bearer <token>
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 数据冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 1001 | 用户名已存在 |
| 1002 | 用户不存在 |
| 1003 | 密码错误 |
| 1004 | 账号已被禁用 |
| 1005 | 账号已被锁定 |
| 1006 | 邮箱已被使用 |
| 1007 | 登录失败次数过多 |
| 1008 | 旧密码错误 |
| 2001 | 帖子不存在 |
| 2002 | 无权操作此帖子 |
| 2003 | 发帖频率超限 |
| 2004 | 帖子已被屏蔽 |
| 2005 | 帖子已被删除 |
| 2006 | 板块不存在 |
| 2007 | 请选择末级板块 |
| 2008 | 该板块存在子板块，无法删除 |
| 2009 | 该板块存在帖子，无法删除 |
| 3001 | 评论不存在 |
| 3002 | 评论频率超限 |
| 3003 | 评论已被屏蔽 |
| 3004 | 无权操作此评论 |
| 4001 | AI服务暂不可用 |
| 4002 | AI回答生成失败 |
| 4003 | 该帖子已有AI回答 |
| 4004 | AI功能未启用 |
| 5001 | 内容包含违规信息 |
| 6001 | 已举报过该内容 |
| 6002 | 举报记录不存在 |
| 6003 | 举报已处理 |
| 7001 | 文件大小超过限制 |
| 7002 | 文件类型不允许 |

---

## 一、认证模块 `/auth`

### 1.1 用户注册

- **POST** `/auth/register`
- 权限: 公开

**请求体:**

```typescript
interface RegisterRequest {
  username: string   // 必填, 4-20位, 仅字母数字下划线
  password: string   // 必填, 8-32位, 必须包含字母和数字
  email?: string     // 可选, 邮箱格式, 最长50
  nickname?: string  // 可选, 2-20位
}
```

**响应:** `Result<void>`

---

### 1.2 用户登录

- **POST** `/auth/login`
- 权限: 公开

**请求体:**

```typescript
interface LoginRequest {
  username: string   // 必填
  password: string   // 必填
}
```

**响应:** `Result<LoginResponse>`

```typescript
interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number       // 秒
  user: UserResponse
}
```

---

### 1.3 刷新Token

- **POST** `/auth/refresh`
- 权限: 公开

**请求体:**

```typescript
interface RefreshTokenRequest {
  refreshToken: string    // 必填
}
```

**响应:** `Result<LoginResponse>`

---

### 1.4 退出登录

- **POST** `/auth/logout`
- 权限: 需登录

**响应:** `Result<void>`

---

### 1.5 获取当前用户信息

- **GET** `/auth/me`
- 权限: 需登录

**响应:** `Result<UserResponse>`

```typescript
interface UserResponse {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  bio: string
  status: number          // 0=正常, 1=禁言, 2=禁用
  roles: string[]         // ["ADMIN","MODERATOR","USER"]
  createdAt: string       // datetime
  updatedAt: string
  lastLoginAt: string
}
```

---

## 二、帖子模块 `/posts`

### 2.1 发布帖子

- **POST** `/posts`
- 权限: 需登录
- 限流: 10次/小时

**请求体:**

```typescript
interface PostCreateRequest {
  categoryId: number      // 必填, 板块ID
  title: string           // 必填, 2-200字
  content: string         // 必填, 最长50000字符
  aiRequested?: boolean   // 可选, 默认false
}
```

**响应:** `Result<number>` (新帖子ID)

---

### 2.2 获取帖子详情

- **GET** `/posts/{id}`
- 权限: 需登录

**路径参数:** `id` - 帖子ID

**响应:** `Result<PostResponse>`

```typescript
interface PostResponse {
  id: number
  categoryId: number
  categoryName: string
  author: UserResponse
  title: string
  content: string
  summary: string
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  shareCount: number
  isTop: number           // 0=否, 1=是
  isEssence: number       // 0=否, 1=是
  aiRequested: number     // 0=否, 1=是
  status: number          // 0=草稿, 1=正常, 2=已删除, 3=已屏蔽
  aiResponse: AiResponseDTO | null
  liked: boolean
  favorited: boolean
  createdAt: string
  updatedAt: string
}

interface AiResponseDTO {
  id: number
  postId: number
  content: string
  model: string
  promptTokens: number
  completionTokens: number
  status: number          // 0=生成中, 1=成功, 2=失败
  errorMessage: string
  createdAt: string
  updatedAt: string
}
```

---

### 2.3 获取帖子列表

- **GET** `/posts`
- 权限: 公开

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | number | 否 | 板块ID筛选 |
| keyword | string | 否 | 关键词搜索 |
| sortBy | string | 否 | 排序: LATEST(默认)/HOTTEST/MOST_COMMENTS |
| isTop | boolean | 否 | 筛选置顶 |
| isEssence | boolean | 否 | 筛选加精 |
| authorId | number | 否 | 作者ID |
| page | number | 否 | 页码, 默认1 |
| size | number | 否 | 每页条数, 默认20 |

**响应:** `Result<PageResult<PostListResponse>>`

```typescript
interface PostListResponse {
  id: number
  categoryId: number
  categoryName: string
  author: UserSimpleResponse
  title: string
  summary: string
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  isTop: number
  isEssence: number
  aiRequested: number
  status: number
  createdAt: string
}

interface UserSimpleResponse {
  id: number
  username: string
  nickname: string
  avatar: string
}
```

---

### 2.4 更新帖子

- **PUT** `/posts/{id}`
- 权限: 需登录 (帖主)

**请求体:** 同 `PostCreateRequest`

**响应:** `Result<void>`

---

### 2.5 删除帖子

- **DELETE** `/posts/{id}`
- 权限: 需登录 (帖主或管理员)

**响应:** `Result<void>`

---

### 2.6 置顶/取消置顶

- **PUT** `/posts/{id}/top`
- 权限: 需登录 (管理员/版主)

**查询参数:** `isTop` - 0=取消置顶, 1=置顶

**响应:** `Result<void>`

---

### 2.7 加精/取消加精

- **PUT** `/posts/{id}/essence`
- 权限: 需登录 (管理员/版主)

**查询参数:** `isEssence` - 0=取消加精, 1=加精

**响应:** `Result<void>`

---

## 三、评论模块 `/comments`

### 3.1 发表评论

- **POST** `/comments`
- 权限: 需登录
- 限流: 30次/小时

**请求体:**

```typescript
interface CommentCreateRequest {
  postId: number          // 必填
  parentId?: number       // 可选, 回复的评论ID
  replyToUserId?: number  // 可选, 回复的用户ID
  content: string         // 必填, 最长1000字
}
```

**响应:** `Result<number>` (新评论ID)

---

### 3.2 删除评论

- **DELETE** `/comments/{id}`
- 权限: 需登录 (评论作者或管理员)

**响应:** `Result<void>`

---

### 3.3 获取帖子评论列表

- **GET** `/comments/post/{postId}`
- 权限: 需登录

**路径参数:** `postId` - 帖子ID

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码, 默认1 |
| size | number | 否 | 每页条数, 默认20 |

**响应:** `Result<PageResult<CommentResponse>>`

```typescript
interface CommentResponse {
  id: number
  postId: number
  parentId: number
  author: UserResponse
  replyToUser: UserResponse | null
  content: string
  likeCount: number
  status: number
  liked: boolean
  createdAt: string
  children: CommentResponse[]
}
```

---

## 四、板块模块 `/categories`

### 4.1 获取板块树

- **GET** `/categories/tree`
- 权限: 公开

**响应:** `Result<CategoryTreeResponse[]>`

```typescript
interface CategoryTreeResponse {
  id: number
  parentId: number
  name: string
  icon: string
  description: string
  sortOrder: number
  status: number          // 0=启用, 1=禁用
  postCount: number
  createdAt: string
  children: CategoryTreeResponse[]
}
```

---

### 4.2 获取板块详情

- **GET** `/categories/{id}`
- 权限: 公开

**响应:** `Result<CategoryTreeResponse>`

---

### 4.3 创建板块

- **POST** `/categories`
- 权限: 需登录 (管理员)

**请求体:** `CategoryTreeResponse` (不含 id/createdAt)

**响应:** `Result<number>` (新板块ID)

---

### 4.4 更新板块

- **PUT** `/categories/{id}`
- 权限: 需登录 (管理员)

**请求体:** `CategoryTreeResponse` (不含 id/createdAt)

**响应:** `Result<void>`

---

### 4.5 删除板块

- **DELETE** `/categories/{id}`
- 权限: 需登录 (管理员)

**响应:** `Result<void>`

---

### 4.6 更新板块状态

- **PUT** `/categories/{id}/status`
- 权限: 需登录 (管理员)

**查询参数:** `status` - 0=启用, 1=禁用

**响应:** `Result<void>`

---

### 4.7 更新板块排序

- **PUT** `/categories/{id}/sort`
- 权限: 需登录 (管理员)

**查询参数:** `sortOrder` - 排序值

**响应:** `Result<void>`

---

## 五、互动模块 `/interaction`

### 5.1 点赞/取消点赞

- **POST** `/interaction/like`
- 权限: 需登录

**请求体:**

```typescript
interface LikeToggleRequest {
  targetId: number        // 必填, 目标ID(帖子/评论)
  targetType: number      // 必填, 1=帖子, 2=评论
}
```

**响应:** `Result<boolean>` (当前是否已点赞)

---

### 5.2 收藏/取消收藏

- **POST** `/interaction/favorite`
- 权限: 需登录

**查询参数:** `postId` - 帖子ID

**响应:** `Result<boolean>` (当前是否已收藏)

---

### 5.3 记录分享

- **POST** `/interaction/share`
- 权限: 需登录

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| postId | number | 是 | 帖子ID |
| channel | string | 否 | 分享渠道 |

**响应:** `Result<void>`

---

### 5.4 举报内容

- **POST** `/interaction/report`
- 权限: 需登录

**请求体:**

```typescript
interface ReportCreateRequest {
  targetId: number        // 必填, 目标ID
  targetType: number      // 必填, 1=帖子, 2=评论
  reason: string          // 必填, 最长500字
}
```

**响应:** `Result<number>` (举报记录ID)

---

### 5.5 检查是否已点赞

- **GET** `/interaction/liked`
- 权限: 需登录

**查询参数:** `targetId` + `targetType`

**响应:** `Result<boolean>`

---

### 5.6 检查是否已收藏

- **GET** `/interaction/favorited`
- 权限: 需登录

**查询参数:** `postId`

**响应:** `Result<boolean>`

---

## 六、管理后台模块 `/admin`

> 所有 `/admin/**` 接口需要 **ADMIN** 角色

### 6.1 获取帖子列表(管理)

- **GET** `/admin/posts`
- 权限: ADMIN

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索 |
| status | number | 否 | 状态筛选 |
| page | number | 否 | 页码, 默认1 |
| size | number | 否 | 每页条数, 默认20 |

**响应:** `Result<PageResult<PostResponse>>`

---

### 6.2 获取评论列表(管理)

- **GET** `/admin/comments`
- 权限: ADMIN

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索 |
| status | number | 否 | 状态筛选 |
| page | number | 否 | 页码, 默认1 |
| size | number | 否 | 每页条数, 默认20 |

**响应:** `Result<PageResult<CommentResponse>>`

---

### 6.3 修改用户状态

- **PUT** `/admin/users/{id}/status`
- 权限: ADMIN

**路径参数:** `id` - 用户ID

**查询参数:** `status` - 0=正常, 1=禁言, 2=禁用

**响应:** `Result<void>`

---

### 6.4 修改用户角色

- **PUT** `/admin/users/{id}/roles`
- 权限: ADMIN

**路径参数:** `id` - 用户ID

**请求体:** `number[]` (角色ID列表)

**响应:** `Result<void>`

---

## 七、枚举值参考

### 用户状态 (UserStatus)

| 值 | 说明 |
|----|------|
| 0 | 正常 |
| 1 | 禁言 |
| 2 | 禁用 |

### 角色代码 (RoleCode)

| 值 | 说明 |
|----|------|
| ADMIN | 管理员 |
| MODERATOR | 版主 |
| USER | 普通用户 |

### 帖子状态 (PostStatus)

| 值 | 说明 |
|----|------|
| 0 | 草稿 |
| 1 | 正常 |
| 2 | 已删除 |
| 3 | 已屏蔽 |

### 板块状态 (CategoryStatus)

| 值 | 说明 |
|----|------|
| 0 | 启用 |
| 1 | 禁用 |

### 目标类型 (TargetType)

| 值 | 说明 |
|----|------|
| 1 | 帖子 |
| 2 | 评论 |

### AI回答状态 (AiResponseStatus)

| 值 | 说明 |
|----|------|
| 0 | 生成中 |
| 1 | 成功 |
| 2 | 失败 |

### 举报状态 (ReportStatus)

| 值 | 说明 |
|----|------|
| 0 | 待处理 |
| 1 | 已忽略 |
| 2 | 已屏蔽 |
| 3 | 已警告 |

### 通知类型 (NotificationType)

| 值 | 说明 |
|----|------|
| 1 | 系统通知 |
| 2 | 点赞 |
| 3 | 评论 |
| 4 | 关注 |
| 5 | 举报处理 |
