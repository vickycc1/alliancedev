import { useState, useEffect, useCallback, useMemo } from 'react'
import { Pagination, Spin, Empty, Tabs, Select, Input, Button, Tag, Typography } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { PostListItem } from '@/types/post'
import type { CategoryTree } from '@/types/category'
import { SortBy } from '@/types/common'
import PostCard from '@/components/PostCard'

const { Search } = Input
const { Title } = Typography

const sortOptions = [
  { value: SortBy.LATEST, label: '最新' },
  { value: SortBy.HOTTEST, label: '最热' },
  { value: SortBy.MOST_COMMENTS, label: '评论最多' },
]

interface PostListPageProps {
  title?: string
  titleIcon?: React.ReactNode
  defaultSortBy?: SortBy
  defaultIsEssence?: boolean
  defaultCategoryId?: number
  onCategoryChange?: (categoryId: number) => void
  hideCategoryTabs?: boolean
  hideSortSelect?: boolean
}

export default function PostListPage({
  title,
  titleIcon,
  defaultSortBy = SortBy.LATEST,
  defaultIsEssence = false,
  defaultCategoryId = 0,
  onCategoryChange,
  hideCategoryTabs = false,
  hideSortSelect = false,
}: PostListPageProps) {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryTree[]>([])
  const [activeCategory, setActiveCategory] = useState<number>(defaultCategoryId)
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy)
  const [isEssence, setIsEssence] = useState(defaultIsEssence)
  const [keyword, setKeyword] = useState('')
  const pageSize = 10

  useEffect(() => {
    setActiveCategory(defaultCategoryId)
    setSortBy(defaultSortBy)
    setIsEssence(defaultIsEssence)
    setPage(1)
  }, [defaultCategoryId, defaultSortBy, defaultIsEssence])

  useEffect(() => {
    request.get<Result<CategoryTree[]>>('/categories/tree').then(({ data }) => {
      if (data.data) setCategories(data.data)
    })
  }, [])

  const allCategoryIds = useMemo(() => {
    const ids = new Set<number>()
    categories.forEach((cat) => {
      ids.add(cat.id)
      cat.children?.forEach((ch) => ids.add(ch.id))
    })
    return ids
  }, [categories])

  const resolvedActiveCategory = allCategoryIds.has(activeCategory) ? activeCategory : 0

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: pageSize, sortBy }
      if (resolvedActiveCategory) params.categoryId = resolvedActiveCategory
      if (keyword) params.keyword = keyword
      if (isEssence) params.isEssence = true
      const { data } = await request.get<Result<PageResult<PostListItem>>>('/posts', { params })
      if (data.data) {
        setPosts(data.data.list)
        setTotal(data.data.total)
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [page, resolvedActiveCategory, sortBy, keyword, isEssence])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCategoryChange = (categoryId: number) => {
    setActiveCategory(categoryId)
    setPage(1)
    onCategoryChange?.(categoryId)
  }

  const handleSortChange = (value: SortBy) => {
    setSortBy(value)
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleRefresh = () => {
    setKeyword('')
    setActiveCategory(defaultCategoryId)
    setSortBy(defaultSortBy)
    setIsEssence(defaultIsEssence)
    setPage(1)
  }

  const categoryTabs = useMemo(() => {
    const items: Array<{ key: string; label: string }> = [{ key: '0', label: '全部' }]
    categories.forEach((cat) => {
      items.push({ key: String(cat.id), label: cat.name })
      cat.children?.forEach((ch) => {
        items.push({ key: String(ch.id), label: `  ${ch.name}` })
      })
    })
    return items
  }, [categories])

  return (
    <div>
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          {titleIcon}
          <Title level={3} style={{ margin: 0 }}>{title}</Title>
        </div>
      )}

      {!hideCategoryTabs && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 8,
          padding: '16px 24px',
          marginBottom: 16,
          border: '1px solid #E5E6EB',
        }}>
          <Tabs
            activeKey={String(resolvedActiveCategory)}
            onChange={(key) => handleCategoryChange(Number(key))}
            items={categoryTabs}
            size="small"
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {!hideSortSelect && (
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={sortOptions}
            style={{ width: 120 }}
          />
        )}
        <Search
          placeholder="搜索帖子"
          allowClear
          onSearch={handleSearch}
          style={{ width: 280 }}
          prefix={<SearchOutlined />}
        />
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>重置</Button>
        {keyword && <Tag closable onClose={() => { setKeyword(''); setPage(1) }}>搜索: {keyword}</Tag>}
        {isEssence && <Tag color="gold" closable onClose={() => { setIsEssence(false); setPage(1) }}>精华帖</Tag>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : posts.length === 0 ? (
        <Empty description="暂无帖子" />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                showTotal={(t) => `共 ${t} 篇`}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
