# UI/UX 设计规范文档

# TechCommunity 企业级技术交流分享社区

---

## 一、设计理念

| 原则 | 说明 |
|------|------|
| 专业高效 | 面向技术人员，界面简洁清晰，信息密度适中，操作路径短 |
| 一致性 | 全站视觉风格、交互模式、文案用语保持统一 |
| 可访问性 | 保证色盲用户、键盘用户可正常使用 |
| 反馈即时 | 每个操作都有明确的视觉反馈，用户始终知道系统状态 |

---

## 二、配色体系

### 2.1 品牌主色

| 色彩 | 色值 | 用途 | 示例 |
|------|------|------|------|
| 主色 Blue | `#1677FF` | 主要按钮、链接、选中态、品牌标识 | ![](https://via.placeholder.com/20/1677FF/1677FF) |
| 主色悬停 | `#4096FF` | 主色按钮/链接 hover 态 | ![](https://via.placeholder.com/20/4096FF/4096FF) |
| 主色按下 | `#0958D9` | 主色按钮 active 态 | ![](https://via.placeholder.com/20/0958D9/0958D9) |
| 主色浅底 | `#E6F4FF` | 主色背景色、选中行背景 | ![](https://via.placeholder.com/20/E6F4FF/E6F4FF) |
| 主色极浅底 | `#F0F5FF` | 信息提示背景 | ![](https://via.placeholder.com/20/F0F5FF/F0F5FF) |

### 2.2 功能色

| 色彩 | 色值 | 用途 | 语义 |
|------|------|------|------|
| 成功 Green | `#52C41A` | 成功提示、在线状态、完成标记 | 成功/正向 |
| 成功悬停 | `#73D13D` | 成功按钮 hover | - |
| 成功浅底 | `#F6FFED` | 成功背景 | - |
| 警告 Orange | `#FAAD14` | 警告提示、待处理状态 | 警告/注意 |
| 警告悬停 | `#FFC53D` | 警告按钮 hover | - |
| 警告浅底 | `#FFFBE6` | 警告背景 | - |
| 错误 Red | `#FF4D4F` | 错误提示、删除按钮、禁用状态 | 错误/危险 |
| 错误悬停 | `#FF7875` | 错误按钮 hover | - |
| 错误浅底 | `#FFF2F0` | 错误背景 | - |
| 信息 Blue | `#1677FF` | 信息提示、帮助说明 | 信息/提示 |

### 2.3 中性色

| 色彩 | 色值 | 用途 |
|------|------|------|
| 标题黑 | `#141824` | 页面主标题、帖子标题 |
| 正文黑 | `#1F2329` | 正文内容、表头 |
| 次要文字 | `#646A73` | 次要信息、描述文字、时间 |
| 辅助文字 | `#8F959E` | 占位符、禁用文字、提示文字 |
| 边框色 | `#DEE0E3` | 卡片边框、分割线 |
| 背景灰 | `#F2F3F5` | 页面背景、输入框背景 |
| 组件背景 | `#F7F8FA` | 侧边栏背景、Tab未选中背景 |
| 纯白 | `#FFFFFF` | 卡片背景、弹窗背景、输入框背景 |

### 2.4 AI专属色

| 色彩 | 色值 | 用途 |
|------|------|------|
| AI渐变起始 | `#667EEA` | AI回答卡片渐变边框左色 |
| AI渐变结束 | `#764BA2` | AI回答卡片渐变边框右色 |
| AI浅底 | `#F8F9FF → #F3F0FF` | AI回答卡片背景渐变 |
| AI标签背景 | `linear-gradient(135deg, #667EEA, #764BA2)` | AI标签胶囊背景 |
| AI图标色 | `#667EEA` | AI机器人图标色 |
| AI文字色 | `#5B4FBF` | AI标识文字色 |

### 2.5 色彩使用规则

```
1. 同一页面主色使用不超过3种（品牌色 + 功能色 + 中性色）
2. 文字颜色层级：标题黑 → 正文黑 → 次要文字 → 辅助文字，不可跳级使用
3. 功能色仅用于语义场景，不可作为装饰色
4. 按钮颜色：主要操作用主色，危险操作用错误色，次要操作用中性色
5. 链接颜色统一使用主色 #1677FF，hover 态 #4096FF
6. AI相关元素统一使用AI专属色，与普通内容形成视觉区分
7. 背景色层级：纯白（卡片）→ 组件背景（侧边栏）→ 背景灰（页面）
```

---

## 三、字体规范

### 3.1 字体栈

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
  'Apple Color Emoji', 'Segoe UI Emoji';
--font-family-code: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
  Courier, monospace;
```

### 3.2 字号层级

| 层级 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| H1 | 24px | 32px | 600 | 页面主标题 |
| H2 | 20px | 28px | 600 | 模块标题 |
| H3 | 16px | 24px | 600 | 卡片标题、Tab标题 |
| H4 | 14px | 22px | 600 | 小标题、列表标题 |
| 正文 | 14px | 22px | 400 | 正文内容、表单标签 |
| 辅助 | 12px | 20px | 400 | 时间、备注、辅助信息 |
| 代码 | 13px | 20px | 400 | 代码块、行内代码 |

### 3.3 字重使用

| 字重 | 值 | 用途 |
|------|-----|------|
| Regular | 400 | 正文、描述、辅助文字 |
| Medium | 500 | 小标题、Tab选中态 |
| Semibold | 600 | 页面标题、模块标题、按钮 |

---

## 四、间距与布局

### 4.1 间距系统（8px网格）

| Token | 值 | 用途 |
|-------|-----|------|
| xs | 4px | 图标与文字间距、紧凑元素内间距 |
| sm | 8px | 表单项间距、标签间距 |
| md | 12px | 卡片内间距、列表项间距 |
| base | 16px | 模块间距、按钮内间距 |
| lg | 24px | 区域间距、卡片间距 |
| xl | 32px | 页面区块间距 |
| 2xl | 48px | 页面顶部间距 |
| 3xl | 64px | 页面大区块间距 |

### 4.2 布局规范

| 区域 | 宽度 | 说明 |
|------|------|------|
| 页面最大宽度 | 1200px | 内容区域居中 |
| 侧边栏宽度 | 240px | 板块导航 |
| 内容区最小宽度 | 768px | 主内容区 |
| 管理后台侧边栏 | 220px | 管理导航 |
| 卡片内间距 | 16px / 24px | 小卡片16px，大卡片24px |

### 4.3 圆角规范

| Token | 值 | 用途 |
|-------|-----|------|
| --radius-sm | 4px | 小元素（标签、Badge） |
| --radius-base | 6px | 按钮、输入框、下拉框 |
| --radius-lg | 8px | 卡片、弹窗、面板 |
| --radius-xl | 12px | 大面板、AI回答卡片 |
| --radius-full | 9999px | 胶囊标签、头像 |

---

## 五、阴影规范

| 层级 | 值 | 用途 |
|------|-----|------|
| shadow-sm | `0 1px 2px 0 rgba(0,0,0,0.05)` | 卡片默认态 |
| shadow-base | `0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08)` | 卡片 hover 态、下拉面板 |
| shadow-lg | `0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.15)` | 弹窗、模态框 |
| shadow-ai | `0 4px 12px -2px rgba(102,126,234,0.2), 0 6px 20px 0 rgba(118,75,162,0.15)` | AI回答卡片专属阴影 |

---

## 六、组件规范

### 6.1 按钮规范

| 类型 | 背景 | 文字 | 边框 | 用途 |
|------|------|------|------|------|
| 主要按钮 | #1677FF | #FFFFFF | 无 | 发布帖子、提交表单、登录 |
| 次要按钮 | #FFFFFF | #1F2329 | #DEE0E3 | 取消、返回 |
| 虚线按钮 | #FFFFFF | #1677FF | #1677FF dashed | 添加板块、新增项 |
| 文字按钮 | 透明 | #1677FF | 无 | 链接式操作 |
| 危险按钮 | #FF4D4F | #FFFFFF | 无 | 删除、屏蔽 |
| AI按钮 | linear-gradient(135deg, #667EEA, #764BA2) | #FFFFFF | 无 | 请求AI回答、重新生成 |

**按钮尺寸**：

| 尺寸 | 高度 | 内间距 | 字号 |
|------|------|--------|------|
| Large | 40px | 0 20px | 16px |
| Default | 32px | 0 16px | 14px |
| Small | 24px | 0 8px | 12px |

**按钮状态**：

| 状态 | 视觉表现 |
|------|---------|
| 默认 | 按上述规范 |
| Hover | 背景色加深一级，cursor: pointer |
| Active | 背景色加深两级，轻微下沉 transform: translateY(1px) |
| Disabled | 透明度 50%，cursor: not-allowed |
| Loading | 左侧显示旋转加载图标，文字保留，cursor: wait |

### 6.2 输入框规范

| 状态 | 边框 | 背景 |
|------|------|------|
| 默认 | 1px solid #DEE0E3 | #FFFFFF |
| Hover | 1px solid #4096FF | #FFFFFF |
| Focus | 1px solid #1677FF + 2px shadow #1677FF/20% | #FFFFFF |
| Error | 1px solid #FF4D4F + 2px shadow #FF4D4F/20% | #FFFFFF |
| Disabled | 1px solid #DEE0E3 | #F7F8FA |

**输入框尺寸**：高度 32px，内间距 0 12px，字号 14px

### 6.3 卡片规范

| 属性 | 值 |
|------|-----|
| 背景 | #FFFFFF |
| 圆角 | 8px |
| 内间距 | 24px |
| 边框 | 1px solid #DEE0E3 |
| 阴影 | shadow-sm |
| Hover阴影 | shadow-base |

### 6.4 标签规范

| 类型 | 背景 | 文字 | 圆角 |
|------|------|------|------|
| 置顶标签 | #FFFBE6 | #FAAD14 | 4px |
| 精华标签 | #F6FFED | #52C41A | 4px |
| AI标签 | linear-gradient(135deg, #667EEA, #764BA2) | #FFFFFF | 9999px（胶囊） |
| 板块标签 | #E6F4FF | #1677FF | 4px |
| 状态-正常 | #F6FFED | #52C41A | 4px |
| 状态-禁用 | #FFF2F0 | #FF4D4F | 4px |
| 状态-待处理 | #FFFBE6 | #FAAD14 | 4px |

---

## 七、交互反馈规范

### 7.1 操作反馈总览

| 操作类型 | 反馈方式 | 持续时间 | 位置 |
|---------|---------|---------|------|
| 成功操作 | 绿色 Toast 提示 | 3秒自动消失 | 页面顶部居中 |
| 失败操作 | 红色 Toast 提示 | 5秒自动消失 | 页面顶部居中 |
| 警告操作 | 橙色 Toast 提示 | 4秒自动消失 | 页面顶部居中 |
| 信息提示 | 蓝色 Toast 提示 | 3秒自动消失 | 页面顶部居中 |
| 危险确认 | 二次确认弹窗 | 需手动关闭 | 页面居中弹窗 |
| 加载等待 | 骨架屏/Spinner | 持续到加载完成 | 内容区域 |
| 表单校验 | 字段下方红色提示 | 持续到修正 | 字段下方 |

### 7.2 Toast提示规范

```
成功示例：
┌──────────────────────────────────┐
│ ✅ 帖子发布成功                    │
└──────────────────────────────────┘
背景：#F6FFED  边框：#B7EB8F  图标色：#52C41A  文字色：#1F2329

失败示例：
┌──────────────────────────────────┐
│ ❌ 帖子发布失败：内容包含违规信息    │
└──────────────────────────────────┘
背景：#FFF2F0  边框：#FFCCC7  图标色：#FF4D4F  文字色：#1F2329

警告示例：
┌──────────────────────────────────┐
│ ⚠️ 您的发帖频率已达上限            │
└──────────────────────────────────┘
背景：#FFFBE6  边框：#FFE58F  图标色：#FAAD14  文字色：#1F2329
```

**Toast动画**：
- 进入：从上方滑入 + 淡入，持续 300ms，ease-out
- 退出：向上滑出 + 淡出，持续 200ms，ease-in

### 7.3 二次确认弹窗规范

```
┌──────────────────────────────────────┐
│                                      │
│  ⚠️ 确认删除帖子                      │
│                                      │
│  删除后帖子将不再展示，此操作不可恢复。  │
│                                      │
│           [取消]    [确认删除]         │
│                                      │
└──────────────────────────────────────┘

- 标题：16px Semibold #1F2329
- 内容：14px Regular #646A73
- 取消按钮：次要按钮
- 确认按钮：危险按钮（红色）
- 弹窗宽度：400px
- 弹窗圆角：12px
```

**弹窗动画**：
- 进入：淡入 + 轻微缩放（0.95 → 1.0），持续 200ms，ease-out
- 退出：淡出 + 轻微缩放（1.0 → 0.95），持续 150ms，ease-in
- 遮罩层：淡入淡出，持续 200ms

### 7.4 表单校验反馈

| 时机 | 反馈方式 |
|------|---------|
| 输入中 | 实时校验，不符合规则时字段下方显示红色提示 |
| 失焦时 | 校验当前字段，错误时边框变红 + 下方提示 |
| 提交时 | 校验所有字段，第一个错误字段自动聚焦 |
| 校验通过 | 错误提示消失，边框恢复正常 |

```
错误状态：
┌─────────────────────────┐
│ 帖子标题                  │  ← 标签 #1F2329
│ ┌─────────────────────┐ │
│ │                     │ │  ← 边框 #FF4D4F
│ └─────────────────────┘ │
│ ⚠️ 请输入帖子标题        │  ← 提示 #FF4D4F 12px
└─────────────────────────┘

正常状态：
┌─────────────────────────┐
│ 帖子标题                  │
│ ┌─────────────────────┐ │
│ │ Spring Boot 3.2...  │ │  ← 边框 #1677FF (focus)
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 7.5 加载状态规范

| 场景 | 加载方式 | 说明 |
|------|---------|------|
| 页面首次加载 | 骨架屏 | 模拟内容布局，减少视觉跳动 |
| 列表加载更多 | 底部Spinner | 小型旋转加载图标 + "加载中..." |
| 下拉刷新 | 顶部下拉指示器 | 下拉 → 释放 → 刷新中 → 完成 |
| 按钮提交 | 按钮内Spinner | 按钮内显示旋转图标，按钮禁用 |
| AI回答生成 | 打字机效果 + 骨架屏 | 骨架屏 → 逐字展示 → 完成 |
| 图片加载 | 模糊占位图 | 低分辨率模糊图 → 清晰图 |

**骨架屏规范**：
```
- 背景：#F2F3F5
- 动画：从左到右光泽扫过效果
- 动画时长：1.5s 循环
- 形状：圆角矩形，与实际内容布局一致
```

### 7.6 空状态规范

```
┌──────────────────────────────────┐
│                                  │
│         ┌──────────┐             │
│         │  空状态   │             │
│         │  插图     │             │
│         └──────────┘             │
│                                  │
│      暂无帖子，快来发布第一篇吧！   │
│                                  │
│         [发布帖子]                │
│                                  │
└──────────────────────────────────┘

- 插图：120x120px，灰色线条风格
- 文字：14px #8F959E
- 按钮：主要按钮（如有操作引导）
```

---

## 八、动画规则

### 8.1 动画原则

| 原则 | 说明 |
|------|------|
| 有意义 | 动画必须服务于功能，不添加纯装饰动画 |
| 快速 | 交互反馈动画不超过 300ms，避免用户等待 |
| 自然 | 使用 ease-out 进入、ease-in 退出，模拟物理惯性 |
| 克制 | 同一时间最多1个主动画，避免视觉混乱 |
| 可关闭 | 尊重 prefers-reduced-motion 系统设置 |

### 8.2 动画时长规范

| 类型 | 时长 | 缓动函数 | 用途 |
|------|------|---------|------|
| 微交互 | 100ms | ease-out | 按钮hover、图标切换 |
| 快速过渡 | 200ms | ease-out | 颜色变化、边框变化 |
| 标准过渡 | 300ms | ease-out | 展开/收起、淡入淡出 |
| 强调过渡 | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | 弹窗出现、重要元素入场 |
| 复杂动画 | 500ms | ease-in-out | 页面切换、大区域变化 |

### 8.3 核心动画定义

#### 8.3.1 页面切换动画

```css
/* 页面淡入 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: pageEnter 300ms ease-out forwards;
}
```

#### 8.3.2 列表项入场动画

```css
/* 列表项依次入场 */
@keyframes listItemEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item-enter {
  animation: listItemEnter 300ms ease-out forwards;
}

/* 依次延迟：每项延迟50ms，最多10项 */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
/* ... */
.list-item:nth-child(n+10) { animation-delay: 450ms; }
```

#### 8.3.3 点赞动画

```css
/* 点赞按钮弹跳 */
@keyframes likeBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.like-button.liked {
  animation: likeBounce 400ms ease-out;
}

/* 点赞粒子效果 */
@keyframes likeParticle {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0);
  }
}
```

#### 8.3.4 AI回答打字机效果

```css
/* AI回答逐字出现 */
@keyframes aiTyping {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ai-content p,
.ai-content code,
.ai-content li {
  animation: aiTyping 200ms ease-out forwards;
}

/* AI思考动画 - 三个点跳动 */
@keyframes aiThinkingDot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.ai-thinking-dot:nth-child(1) { animation: aiThinkingDot 1.4s ease-in-out infinite 0ms; }
.ai-thinking-dot:nth-child(2) { animation: aiThinkingDot 1.4s ease-in-out infinite 200ms; }
.ai-thinking-dot:nth-child(3) { animation: aiThinkingDot 1.4s ease-in-out infinite 400ms; }
```

**AI思考状态展示**：
```
┌──────────────────────────────────────────┐
│  🤖 AI 助手回答                    思考中  │
│──────────────────────────────────────────│
│                                          │
│         AI 正在思考 ● ● ●                │
│                                          │
│──────────────────────────────────────────│
│  预计需要 10~30 秒                        │
└──────────────────────────────────────────┘
```

#### 8.3.5 通知铃铛动画

```css
/* 新通知到达 - 铃铛摇晃 */
@keyframes bellShake {
  0% { transform: rotate(0); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-12deg); }
  45% { transform: rotate(8deg); }
  60% { transform: rotate(-6deg); }
  75% { transform: rotate(3deg); }
  100% { transform: rotate(0); }
}

.notification-bell.has-new {
  animation: bellShake 600ms ease-out;
}

/* 未读数角标弹入 */
@keyframes badgePop {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.notification-badge {
  animation: badgePop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

#### 8.3.6 收藏动画

```css
/* 收藏星标填充 */
@keyframes favoriteFill {
  0% { transform: scale(1); }
  30% { transform: scale(1.25); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.favorite-button.favorited {
  animation: favoriteFill 350ms ease-out;
}
```

#### 8.3.7 骨架屏动画

```css
/* 骨架屏光泽扫过 */
@keyframes skeletonShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #F2F3F5 25%,
    #E8E9EB 37%,
    #F2F3F5 63%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}
```

#### 8.3.8 卡片Hover动画

```css
/* 帖子卡片悬停 */
.post-card {
  transition: box-shadow 200ms ease-out,
              transform 200ms ease-out;
}

.post-card:hover {
  box-shadow: 0 3px 6px -4px rgba(0,0,0,0.12),
              0 6px 16px 0 rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

/* AI回答卡片悬停 - 渐变边框发光 */
.ai-card {
  transition: box-shadow 300ms ease-out;
}

.ai-card:hover {
  box-shadow: 0 4px 12px -2px rgba(102,126,234,0.3),
              0 6px 20px 0 rgba(118,75,162,0.2);
}
```

#### 8.3.9 展开收起动画

```css
/* 评论展开/收起 */
.expandable-content {
  overflow: hidden;
  transition: max-height 300ms ease-out,
              opacity 200ms ease-out;
}

.expandable-content.collapsed {
  max-height: 0;
  opacity: 0;
}

.expandable-content.expanded {
  max-height: 500px;
  opacity: 1;
}
```

#### 8.3.10 数字变化动画

```css
/* 点赞数/评论数变化 */
@keyframes numberPop {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(-8px); opacity: 0; }
  51% { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.number-change {
  animation: numberPop 300ms ease-out;
}
```

### 8.4 减弱动画模式

```css
/* 尊重系统 prefers-reduced-motion 设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 九、图标规范

### 9.1 图标风格

| 属性 | 规范 |
|------|------|
| 风格 | 线性图标（Outlined），2px线宽 |
| 尺寸 | 16px（行内）/ 20px（按钮内）/ 24px（独立操作） |
| 颜色 | 跟随文字颜色或使用语义色 |
| 来源 | Ant Design Icons |

### 9.2 功能图标映射

| 功能 | 图标 | 未激活色 | 激活色 |
|------|------|---------|--------|
| 点赞 | LikeOutlined / LikeFilled | #8F959E | #1677FF |
| 评论 | MessageOutlined | #8F959E | #1677FF |
| 收藏 | StarOutlined / StarFilled | #8F959E | #FAAD14 |
| 分享 | ShareAltOutlined | #8F959E | #1677FF |
| 举报 | WarningOutlined | #8F959E | #FF4D4F |
| 通知 | BellOutlined | #646A73 | #1677FF |
| 搜索 | SearchOutlined | #8F959E | #1677FF |
| AI | RobotOutlined | #8F959E | #667EEA |
| 置顶 | PushpinFilled | - | #FAAD14 |
| 精华 | FireFilled | - | #FF4D4F |

---

## 十、响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|---------|
| Desktop XL | ≥1440px | 完整布局，侧边栏常驻 |
| Desktop | ≥1200px | 完整布局，侧边栏常驻 |
| Tablet | ≥768px | 侧边栏收起为抽屉，内容区全宽 |
| Mobile | <768px | 暂不适配（当前仅PC端） |

---

## 十一、AI回答卡片视觉规范详解

### 11.1 卡片结构

```
┌─ 2px 渐变边框 (#667EEA → #764BA2) ──────────────────────┐
│                                                          │
│  ┌─ AI浅底渐变背景 (#F8F9FF → #F3F0FF) ───────────────┐  │
│  │                                                    │  │
│  │  🤖  AI 助手回答               [GPT-4o-mini 胶囊]   │  │
│  │  ─────────────────────────────────────────────     │  │
│  │                                                    │  │
│  │  AI回答内容区域（Markdown渲染）                      │  │
│  │                                                    │  │
│  │  - 代码块：深色主题 (#1E1E2E)                       │  │
│  │  - 表格：白色背景 + 浅灰边框                        │  │
│  │  - 列表：正常Markdown渲染                           │  │
│  │                                                    │  │
│  │  ─────────────────────────────────────────────     │  │
│  │                                                    │  │
│  │  🔄 重新生成（仅帖主）     2026-05-06 10:30        │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 11.2 卡片样式参数

| 属性 | 值 |
|------|-----|
| 外边框 | 2px solid, 渐变 #667EEA → #764BA2 |
| 外圆角 | 12px |
| 内背景 | linear-gradient(135deg, #F8F9FF, #F3F0FF) |
| 内间距 | 20px |
| AI图标 | 🤖 20px, 颜色 #667EEA |
| AI标题 | 16px Semibold, 颜色 #5B4FBF |
| AI胶囊标签 | 背景: 渐变 #667EEA → #764BA2, 文字: #FFFFFF 12px, 圆角: 9999px |
| 分割线 | 1px solid #E8E5F0 |
| 内容文字 | 14px Regular, #1F2329 |
| 代码块背景 | #1E1E2E, 圆角 8px, 内间距 16px |
| 底部时间 | 12px Regular, #8F959E |
| 重新生成按钮 | 文字按钮, 颜色 #667EEA, hover #5B4FBF |
| Hover阴影 | shadow-ai |
| 与帖子内容间距 | 24px |
| 与评论区间距 | 16px |

### 11.3 AI回答状态视觉

| 状态 | 视觉表现 |
|------|---------|
| 生成中 | 骨架屏 + "AI 正在思考 ● ● ●" + 预计时间提示 |
| 流式输出 | 逐字出现（打字机效果），光标闪烁 |
| 已完成 | 完整Markdown渲染内容 |
| 生成失败 | 红色边框 + "AI回答生成失败" + 重新生成按钮 |
| 无AI回答 | 不显示AI回答卡片区域 |

---

## 十二、暗色模式预留

> 当前版本仅实现亮色模式，以下为暗色模式预留规范，后续迭代实现。

| 亮色值 | 暗色值 | 用途 |
|--------|--------|------|
| #FFFFFF | #141414 | 卡片/弹窗背景 |
| #F7F8FA | #1F1F1F | 侧边栏背景 |
| #F2F3F5 | #262626 | 页面背景 |
| #1F2329 | #F0F0F0 | 正文文字 |
| #646A73 | #A6A6A6 | 次要文字 |
| #DEE0E3 | #424242 | 边框 |
