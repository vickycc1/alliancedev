import { useState, useEffect, useCallback } from 'react'
import { Pagination, Spin, Empty, Typography } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { PostListItem } from '@/types/post'
import PostCard from '@/components/PostCard'

const { Title } = Typography

export default function Favorites() {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PageResult<PostListItem>>>('/posts/favorites', {
        params: { page, size: pageSize },
      })
      if (data.data) {
        setPosts(data.data.list)
        setTotal(data.data.total)
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
      }}>
        <HeartOutlined style={{ color: '#F5222D', fontSize: 24 }} />
        <Title level={3} style={{ margin: 0 }}>我的收藏</Title>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : posts.length === 0 ? (
        <Empty description="暂无收藏帖子" />
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
