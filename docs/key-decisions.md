# 关键决策记录

> 本文档记录 TechCommunity 项目前后端联调阶段（T-9.1.1）的关键技术决策，涵盖安全、架构和功能实现。

---

## ADR-001 敏感词过滤 — 基于首字符分组的匹配算法

**状态**: 已实施

**背景**: 管理后台配置敏感词后，需要对用户发布的帖子标题、帖子内容和评论内容进行实时过滤。敏感词库存储在数据库 `t_sensitive_word` 表中，需在应用启动时加载到内存，并支持管理后台动态刷新。

**决策**: 采用「首字符分组 + 全量集合」双索引结构，而非传统 DFA 有限状态机。

**实现细节**:

| 组件 | 说明 |
|------|------|
| `sensitiveWordMap: Map<Character, Set<String>>` | 按首字符分组，用于 `containsSensitiveWord` 快速检测 |
| `allSensitiveWords: Set<String>` | 全量敏感词集合，用于 `filterSensitiveWord` 替换 |
| 加载时 `trim().toLowerCase()` | 去除数据库中敏感词前后空格，统一小写存储 |
| 匹配时 `content.toLowerCase()` | 检测和替换均忽略大小写 |

**核心流程**:

```
发布内容 → cleanHtml(XSS清洗) → containsSensitiveWord(检测)
  ├─ 命中 → 抛出 CONTENT_SENSITIVE (5001) → 前端提示"内容包含违规信息"
  └─ 未命中 → 正常保存
```

**替代方案**:
- 传统 DFA（Trie 树）：更优的 O(n) 时间复杂度，但当前敏感词规模（百级）下性能差异可忽略，首字符分组实现更简单直观。
- Aho-Corasick 自动机：适合万级以上敏感词，当前规模无需引入。

**涉及文件**:
- `ContentFilterService.java` — 接口定义（含 `refreshSensitiveWords()`）
- `ContentFilterServiceImpl.java` — 核心实现
- `PostServiceImpl.java` — 发帖/更新时调用检测
- `CommentServiceImpl.java` — 评论时调用检测
- `AdminController.java` — 增删改敏感词后调用 `refreshSensitiveWords()`

---

## ADR-002 敏感词缓存动态刷新机制

**状态**: 已实施

**背景**: 敏感词在应用启动时通过 `@PostConstruct` 加载到内存。管理后台新增、删除、批量导入敏感词后，内存中的缓存必须同步更新，否则新词不会生效。

**决策**: 在 AdminController 的三个敏感词操作端点后，立即调用 `contentFilterService.refreshSensitiveWords()`，清空内存缓存并重新从数据库加载。

**刷新时机**:

| 操作 | 端点 | 刷新 |
|------|------|------|
| 添加敏感词 | `POST /admin/sensitive-words` | ✅ |
| 删除敏感词 | `DELETE /admin/sensitive-words/{id}` | ✅ |
| 批量导入 | `POST /admin/sensitive-words/batch` | ✅ |

**替代方案**:
- 定时轮询刷新：延迟高，管理后台操作后可能数秒才生效。
- Redis Pub/Sub：引入额外依赖，当前单实例部署无必要。
- 数据库事件监听：MyBatis-Plus 无原生支持，实现复杂。

---

## ADR-003 XSS 防护 — HTML 内容清洗策略

**状态**: 已实施

**背景**: 帖子内容支持富文本（HTML），需防止 XSS 攻击，同时保留合法格式标签。

**决策**: 采用「黑名单移除 + 事件处理器替换」策略，而非白名单标签过滤。

**清洗规则**:

| 规则 | 处理方式 |
|------|----------|
| `<script>` 标签 | 正则移除 |
| `<iframe>` 标签 | 正则移除 |
| `<object>` 标签 | 正则移除 |
| `<embed>` 标签 | 正则移除 |
| `onXxx=` 事件处理器 | 替换为 `data-blocked=` |
| `javascript:` 协议 | 替换为 `blocked:` |
| `expression()` CSS 表达式 | 替换为 `blocked(` |

**调用时机**: `PostServiceImpl.createPost` / `updatePost` 和 `CommentServiceImpl.addComment` 中，在敏感词检测之前先调用 `cleanHtml()`。

**替代方案**:
- 白名单标签过滤（仅保留 ALLOWED_TAGS）：更安全但会破坏用户已有内容格式，当前 ALLOWED_TAGS 已定义但未在 `cleanHtml` 中使用，保留后续升级空间。
- OWASP Java HTML Sanitizer：功能更完善，但引入外部依赖，当前规模下自实现足够。

---

## ADR-004 举报功能 — 帖子与评论统一举报接口

**状态**: 已实施

**背景**: 用户需对违规帖子和评论进行举报，管理后台统一处理。举报目标类型通过 `targetType` 字段区分。

**决策**: 使用单一举报接口 `POST /interaction/report`，通过 `targetType` 参数区分举报对象类型。

**目标类型枚举**:

| targetType | 含义 |
|------------|------|
| 1 | 帖子 (POST) |
| 2 | 评论 (COMMENT) |
| 3 | 用户 (USER) — 预留 |

**举报请求体**:
```typescript
interface ReportCreateRequest {
  targetId: number      // 举报目标ID
  targetType: number    // 目标类型 (1=帖子, 2=评论)
  reason: string        // 举报原因 (最长500字)
}
```

**前端举报入口**:

| 位置 | targetType | 触发方式 |
|------|------------|----------|
| 帖子详情页 — 帖子操作栏 | POST (1) | 点击"举报"按钮 → Modal 选择原因 |
| 评论列表 — 评论操作栏 | COMMENT (2) | 点击举报图标 → Modal 选择原因 |

**举报原因选项**: 垃圾广告、虚假信息、违法违规、抄袭侵权、人身攻击、内容违规、其他（可输入自定义原因）

**错误码**:

| 错误码 | 说明 |
|--------|------|
| 6001 | 已举报过该内容 |
| 6002 | 举报记录不存在 |
| 6003 | 举报已处理 |

**涉及文件**:
- 后端: `InteractionController.java`、`ReportCreateRequest.java`、`Report.java`
- 前端: `Post/index.tsx`（帖子举报）、`CommentList/index.tsx`（评论举报）

---

## ADR-005 登录安全 — 失败锁定与自动解锁

**状态**: 已实施（前序会话完成）

**背景**: 防止暴力破解攻击，需在连续登录失败后锁定账户。

**决策**: 基于数据库字段 `login_fail_count` 和 `locked_until` 实现登录锁定。

**规则**:
- 连续失败 5 次后锁定账户
- 锁定时间 30 分钟
- `locked_until` 过期后自动解锁，失败计数清零
- 登录成功时重置失败计数

---

## ADR-006 文件上传与静态资源访问

**状态**: 已实施（前序会话完成）

**背景**: 用户头像上传后需可访问显示。

**决策**: 本地文件存储 + Spring MVC 资源映射。

**配置**:
- 上传路径: `upload.path` 配置项
- 访问路径: `/uploads/**` → 映射到本地文件目录
- `WebMvcConfigurer.addResourceHandlers()` 配置资源映射

---

## ADR-007 Spring Security 权限控制

**状态**: 已实施（前序会话完成）

**背景**: 管理后台接口需限制仅管理员访问，普通用户接口需登录认证。

**决策**: 基于 `@PreAuthorize` 注解的 RBAC 权限控制。

**关键规则**:
- 管理接口: `@PreAuthorize("hasRole('ADMIN')")` — 角色前缀 `ROLE_` 由 Spring Security 自动添加
- JWT 认证: 请求头 `Authorization: Bearer <token>`
- 公开接口: 注册、登录、帖子列表等无需认证
- CORS: 允许前端开发服务器跨域访问

---

## 错误码汇总

| 错误码 | 常量 | 说明 | 触发场景 |
|--------|------|------|----------|
| 5001 | CONTENT_SENSITIVE | 内容包含违规信息 | 发帖/评论含敏感词 |
| 6001 | — | 已举报过该内容 | 重复举报 |
| 6002 | — | 举报记录不存在 | 查询不存在的举报 |
| 6003 | — | 举报已处理 | 操作已处理的举报 |
| 2007 | — | 请选择末级板块 | 发帖到非叶子板块 |
