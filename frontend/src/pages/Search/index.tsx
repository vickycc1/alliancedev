import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Pagination, Spin, Input, Typography, Select, Tag, Card, Space,
} from 'antd'
import { SearchOutlined, FireOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { PostListItem } from '@/types/post'
import type { CategoryTree } from '@/types/category'
import { SortBy } from '@/types/common'
import PostCard from '@/components/PostCard'

const { Text } = Typography

const sortOptions = [
  { value: SortBy.LATEST, label: '最新' },
  { value: SortBy.HOTTEST, label: '最热' },
  { value: SortBy.MOST_COMMENTS, label: '评论最多' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('q') || ''
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState(keyword)
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.LATEST)
  const [categoryId, setCategoryId] = useState<number>(0)
  const [categories, setCategories] = useState<CategoryTree[]>([])
  const [hotKeywords, setHotKeywords] = useState<string[]>([])
  const pageSize = 10

  useEffect(() => {
    request.get<Result<CategoryTree[]>>('/categories/tree').then(({ data }) => {
      if (data.data) setCategories(data.data)
    })
    request.get<Result<string[]>>('/search/hot-keywords').then(({ data }) => {
      if (data.data) setHotKeywords(data.data)
    })
  }, [])

  useEffect(() => {
    setSearchValue(keyword)
  }, [keyword])

  const fetchPosts = useCallback(async (kw: string, p: number, sort: SortBy, catId: number) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: p, size: pageSize, sortBy: sort }
      if (kw.trim()) params.keyword = kw
      if (catId) params.categoryId = catId
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
  }, [])

  useEffect(() => {
    fetchPosts(keyword, page, sortBy, categoryId)
  }, [keyword, page, sortBy, categoryId, fetchPosts])

  const handleSearch = (value: string) => {
    const v = value.trim()
    if (v) {
      setSearchParams({ q: v })
    } else {
      setSearchParams({})
    }
    setPage(1)
    setSortBy(SortBy.LATEST)
    setCategoryId(0)
  }

  const handleClear = () => {
    setSearchValue('')
    setSearchParams({})
    setPage(1)
    setSortBy(SortBy.LATEST)
    setCategoryId(0)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
  }

  const handleSortChange = (value: SortBy) => {
    setSortBy(value)
    setPage(1)
  }

  const handleCategoryChange = (value: number) => {
    setCategoryId(value)
    setPage(1)
  }

  const handleHotKeywordClick = (kw: string) => {
    setSearchValue(kw)
    setSearchParams({ q: kw })
    setPage(1)
    setSortBy(SortBy.LATEST)
    setCategoryId(0)
  }

  const categoryOptions = [
    { value: 0, label: '全部分类' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
    ...categories.flatMap((cat) =>
      (cat.children || []).map((ch) => ({
        value: ch.id,
        label: `  └ ${ch.name}`,
      }))
    ),
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Input.Search
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          placeholder="搜索帖子标题或内容"
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
          allowClear
          onClear={handleClear}
        />
      </div>

      {hotKeywords.length > 0 && (
        <Card
          style={{ marginBottom: 24, borderRadius: 8 }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <FireOutlined style={{ color: '#F5222D', fontSize: 16 }} />
            <Text strong>热门搜索</Text>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hotKeywords.map((kw, index) => (
              <Tag
                key={kw}
                style={{
                  cursor: 'pointer',
                  padding: '4px 12px',
                  fontSize: 13,
                  borderRadius: 16,
                }}
                color={index < 3 ? 'red' : 'default'}
                onClick={() => handleHotKeywordClick(kw)}
              >
                {index < 3 && <FireOutlined style={{ marginRight: 4 }} />}
                {kw}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <Text style={{ color: '#8F959E' }}>
          {keyword
            ? <>搜索 "<Text strong>{keyword}</Text>" 的结果，共 {total} 篇</>
            : <>全部帖子，共 {total} 篇</>
          }
        </Text>
        <Space>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            options={sortOptions}
            style={{ width: 120 }}
            size="small"
          />
          <Select
            value={categoryId}
            onChange={handleCategoryChange}
            options={categoryOptions}
            style={{ width: 140 }}
            size="small"
            placeholder="选择分类"
          />
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <SearchOutlined style={{ fontSize: 48, color: '#C9CDD4', marginBottom: 16 }} />
          <div style={{ color: '#8F959E' }}>
            {keyword ? `未找到与"${keyword}"相关的帖子` : '暂无帖子'}
          </div>
        </div>
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
                onChange={handlePageChange}
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
