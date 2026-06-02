# React 代码审核指南

## 1. 审核流程

### 1.1 提交前自查（作者）

- [ ] 本地 `tsc --noEmit` 无类型错误
- [ ] ESLint 无 error 级别告警（warning 需注释说明）
- [ ] 核心路径手动验证通过
- [ ] 无 `console.log` / `debugger` 残留
- [ ] 无硬编码密钥、Token、内网地址

### 1.2 审核顺序

```
架构设计 → 类型安全 → 性能 → 状态管理 → 副作用 → 可访问性 → 样式
```

---

## 2. 架构与组件设计

### 2.1 组件职责

| 检查项 | 说明 |
|--------|------|
| 单一职责 | 每个组件只做一件事，超过 150 行考虑拆分 |
| 展示 vs 容器 | 展示组件不直接调用 API，容器组件不包含 UI 逻辑 |
| Props 下钻 | 超过 3 层 props 传递应考虑 Context 或状态管理 |
| 组件命名 | PascalCase，名称应体现功能而非实现 |

### 2.2 组件拆分信号

```tsx
// ❌ 做太多事的组件
function UserPage() {
  // 200行：数据获取 + 表单逻辑 + 列表渲染 + 弹窗管理
}

// ✅ 拆分后
function UserPage() {
  return (
    <>
      <UserForm />
      <UserList />
      <UserDetailModal />
    </>
  )
}
```

### 2.3 目录结构

```
src/
├── components/        # 通用组件
│   └── Button/
│       ├── index.tsx
│       └── style.module.css
├── pages/             # 页面组件
├── hooks/             # 自定义 Hooks
├── store/             # 状态管理
├── api/               # API 请求
├── types/             # 类型定义
└── utils/             # 工具函数
```

---

## 3. TypeScript 类型安全

### 3.1 禁止 any

```tsx
// ❌
const data: any = response.data
const handleClick = (e: any) => {}

// ✅
const data: UserResponse = response.data
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
```

### 3.2 Props 类型定义

```tsx
// ❌ 内联类型
function Card({ title, count }: { title: string; count: number }) {}

// ✅ 独立接口
interface CardProps {
  title: string
  count: number
  onClick?: () => void
}

function Card({ title, count, onClick }: CardProps) {}
```

### 3.3 常见类型问题

| 问题 | 正确做法 |
|------|----------|
| 可选链缺失 | `user?.name` 而非 `user.name` |
| 类型断言滥用 | 用类型守卫替代 `as` |
| 枚举值未约束 | 用联合类型 `"pending" \| "success" \| "error"` |
| API 响应无类型 | 定义 `Result<T>` 泛型 |

---

## 4. 性能审核

### 4.1 重渲染控制

```tsx
// ❌ 每次渲染创建新引用
function Parent() {
  const [count, setCount] = useState(0)
  return <Child onClick={() => doSomething()} items={[1, 2, 3]} />
}

// ✅ 稳定引用
function Parent() {
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => doSomething(), [dep])
  const items = useMemo(() => [1, 2, 3], [])
  return <Child onClick={handleClick} items={items} />
}
```

### 4.2 性能检查清单

| 检查项 | 触发条件 |
|--------|----------|
| `useMemo` | 昂贵计算或引用稳定性需求 |
| `useCallback` | 回调传给子组件且子组件做了 memo |
| `React.memo` | 纯展示组件、渲染开销大、props 稳定 |
| 列表 key | 必须用唯一 ID，禁止 index |
| 懒加载 | 路由级 `React.lazy` + `Suspense` |
| 虚拟列表 | 列表超过 200 条时使用 |

### 4.3 反模式

```tsx
// ❌ 在渲染中创建组件（每次都是新组件，无法复用状态）
function Parent() {
  function Child() { return <div /> }
  return <Child />
}

// ❌ 过度 memo（简单组件不需要）
const SimpleText = React.memo(({ text }: { text: string }) => <span>{text}</span>)

// ❌ useMemo 包裹简单值
const label = useMemo(() => `共 ${count} 条`, [count]) // 直接算即可
```

---

## 5. 状态管理

### 5.1 状态放置原则

```
局部状态 → 组件内 useState/useReducer
共享状态 → Context / Zustand / Redux
服务端状态 → React Query / SWR
URL 状态 → URL 参数
```

### 5.2 Zustand 审核要点

```tsx
// ❌ 整个 store 触发重渲染
const store = useStore()

// ✅ 选择器精确订阅
const user = useStore((s) => s.user)
const isLoading = useStore((s) => s.isLoading)

// ❌ 异步操作放在组件中
const fetchData = async () => {
  setLoading(true)
  try { const res = await api() } finally { setLoading(false) }
}

// ✅ 异步操作放在 store action 中
const useStore = create((set) => ({
  data: null,
  loading: false,
  fetchData: async () => {
    set({ loading: true })
    try {
      const res = await api()
      set({ data: res })
    } finally {
      set({ loading: false })
    }
  },
}))
```

### 5.3 派生状态

```tsx
// ❌ 冗余状态
const [items, setItems] = useState([])
const [filteredItems, setFilteredItems] = useState([]) // 与 items 同步？

// ✅ 计算派生
const [items, setItems] = useState([])
const [keyword, setKeyword] = useState('')
const filteredItems = useMemo(
  () => items.filter((i) => i.name.includes(keyword)),
  [items, keyword]
)
```

---

## 6. 副作用与数据获取

### 6.1 useEffect 审核要点

```tsx
// ❌ 缺少依赖项
useEffect(() => {
  fetchData(userId)
}, []) // userId 变化时不会重新获取

// ✅ 声明完整依赖
useEffect(() => {
  fetchData(userId)
}, [userId])

// ❌ 无清理函数（内存泄漏）
useEffect(() => {
  const timer = setInterval(tick, 1000)
  // 缺少 return () => clearInterval(timer)
}, [])

// ✅ 清理副作用
useEffect(() => {
  const controller = new AbortController()
  fetchData(userId, { signal: controller.signal })
  return () => controller.abort()
}, [userId])
```

### 6.2 数据获取模式

```tsx
// ❌ useEffect + useState 手动管理
useEffect(() => {
  setLoading(true)
  api.getData().then(setData).catch(setError).finally(() => setLoading(false))
}, [])

// ✅ 自定义 Hook 封装
function useData<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null, loading: true, error: null,
  })
  useEffect(() => {
    const controller = new AbortController()
    fetcher().then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }))
    return () => controller.abort()
  }, [fetcher])
  return state
}
```

---

## 7. 错误处理

### 7.1 边界与兜底

| 层级 | 方案 |
|------|------|
| 组件级 | try-catch + 错误状态 |
| 路由级 | ErrorBoundary 包裹路由 |
| 全局级 | API 拦截器统一处理 401/403/500 |
| 用户提示 | message.error / notification.error |

### 7.2 异步错误

```tsx
// ❌ 未捕获的 Promise 异常
api.deleteItem(id).then(() => refresh())

// ✅ 完整错误处理
try {
  await api.deleteItem(id)
  message.success('删除成功')
  refresh()
} catch (err) {
  if (axios.isCancel(err)) return
  message.error(err.response?.data?.message || '删除失败')
}
```

---

## 8. 安全审核

| 检查项 | 说明 |
|--------|------|
| XSS | 禁止 `dangerouslySetInnerHTML`，必须时做 HTML 消毒 |
| URL 注入 | 跳转链接校验协议（仅允许 http/https） |
| 敏感数据 | Token 存 httpOnly Cookie 或内存，禁止 localStorage 明文 |
| API 鉴权 | 每个请求携带 Token，401 自动跳登录 |
| 依赖安全 | `npm audit` 无高危漏洞 |

---

## 9. 可访问性（a11y）

```tsx
// ❌ 不可访问的按钮
<div onClick={handleClick} className="btn">提交</div>

// ✅ 语义化 + 键盘支持
<button onClick={handleClick} type="submit">提交</button>

// ❌ 图片无替代文本
<img src="/logo.png" />

// ✅
<img src="/logo.png" alt="公司Logo" />

// 常见检查
// - 表单 input 有 label 关联
// - 交互元素可 Tab 聚焦
// - 颜色对比度 ≥ 4.5:1
// - 弹窗有 aria-modal 和焦点陷阱
```

---

## 10. 样式审核

### 10.1 规范

| 检查项 | 说明 |
|--------|------|
| CSS Modules / CSS-in-JS | 避免全局样式污染 |
| 命名规范 | BEM 或 camelCase，语义化 |
| 魔法数字 | `margin: 17px` → 用 design token |
| !important | 禁止使用，说明选择器优先级有问题 |
| 响应式 | 关键页面需适配移动端 |

### 10.2 Ant Design 特定

```tsx
// ❌ 覆盖组件样式用全局 CSS
.ant-modal-body { padding: 0; }

// ✅ 使用 token 或 className 定向覆盖
<Modal styles={{ body: { padding: 0 } }} />

// ❌ 内联样式堆叠
<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px' }}>

// ✅ CSS Module 或 className
<div className={styles.header}>
```

---

## 11. 测试审核

| 类型 | 覆盖范围 | 工具 |
|------|----------|------|
| 单元测试 | 工具函数、Hook | Vitest |
| 组件测试 | 交互逻辑、渲染输出 | Testing Library |
| 集成测试 | 页面流程 | Playwright / Cypress |

### 关键测试场景

- [ ] 表单验证（必填、格式、边界值）
- [ ] 异步加载状态（loading / error / empty）
- [ ] 用户交互（点击、输入、快捷键）
- [ ] 权限控制（未登录跳转、按钮禁用）

---

## 12. 审核 Checklist 速查

```
□ 类型安全：无 any，Props 有接口定义
□ 组件设计：单一职责，无过度嵌套
□ 性能：列表有 key，大列表虚拟化，引用稳定
□ 状态：精确订阅，无冗余派生状态
□ 副作用：依赖完整，有清理函数
□ 错误处理：异步有 catch，全局有兜底
□ 安全：无 XSS，Token 安全存储
□ 可访问性：语义化标签，键盘可操作
□ 样式：无全局污染，无魔法数字
□ 代码整洁：无 console.log，无死代码
```

---

## 13. 常见 Code Review 意见模板

| 级别 | 示例 |
|------|------|
| **必须修改** | "这里缺少 error boundary，接口异常会导致白屏" |
| **建议优化** | "建议用 useMemo 包裹这个计算，列表数据量大时会有性能问题" |
| **提问讨论** | "这个状态为什么放在组件内而不是 store？是否有其他组件需要共享？" |
| **肯定认可** | "自定义 Hook 抽取得很好，复用性很强" |
