import { useState, useEffect, useCallback } from 'react'
import { List, Tabs, Tag, Empty, Spin, Pagination, Typography } from 'antd'
import { EyeOutlined, LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { PostListItem } from '@/types/post'
import type { CommentWithUser } from '@/types/comment'
import { PostStatus, CommentStatus } from '@/types/common'

const { Text, Paragraph } = Typography

interface UserContentTabsProps {
  userId: number
}

export default function UserContentTabs({ userId }: UserContentTabsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(false)

  const [posts, setPosts] = useState<PostListItem[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [postsPage, setPostsPage] = useState(1)

  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [commentsPage, setCommentsPage] = useState(1)

  const [favorites, setFavorites] = useState<PostListItem[]>([])
  const [favoritesTotal, setFavoritesTotal] = useState(0)
  const [favoritesPage, setFavoritesPage] = useState(1)

  const pageSize = 10

  const fetchPosts = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PageResult<PostListItem>>>('/user/posts', {
        params: { userId, page, size: pageSize },
      })
      if (data.data) {
        setPosts(data.data.list)
        setPostsTotal(data.data.total)
        setPostsPage(page)
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchComments = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PageResult<CommentWithUser>>>('/user/comments', {
        params: { userId, page, size: pageSize },
      })
      if (data.data) {
        setComments(data.data.list)
        setCommentsTotal(data.data.total)
        setCommentsPage(page)
      }
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchFavorites = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PageResult<PostListItem>>>('/user/favorites', {
        params: { userId, page, size: pageSize },
      })
      if (data.data) {
        setFavorites(data.data.list)
        setFavoritesTotal(data.data.total)
        setFavoritesPage(page)
      }
    } catch {
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts(postsPage)
    else if (activeTab === 'comments') fetchComments(commentsPage)
    else if (activeTab === 'favorites') fetchFavorites(favoritesPage)
  }, [activeTab, fetchPosts, fetchComments, fetchFavorites, postsPage, commentsPage, favoritesPage])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const postStatusMap: Record<PostStatus, { label: string; color: string }> = {
    [PostStatus.DRAFT]: { label: '草稿', color: 'default' },
    [PostStatus.NORMAL]: { label: '已发布', color: 'green' },
    [PostStatus.BLOCKED]: { label: '已屏蔽', color: 'red' },
    [PostStatus.DELETED]: { label: '已删除', color: 'default' },
  }

  const renderPostItem = (item: PostListItem) => {
    const statusInfo = postStatusMap[item.status]
    return (
      <List.Item
        style={{ cursor: 'pointer', padding: '16px 0' }}
        onClick={() => navigate(`/post/${item.id}`)}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
            {item.isTop === 1 && <Tag color="red" style={{ marginLeft: 4 }}>置顶</Tag>}
            {item.isEssence === 1 && <Tag color="gold">精华</Tag>}
            {statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
          </div>
          {item.summary && (
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ color: '#5A5A5A', marginBottom: 8, fontSize: 13 }}
            >
              {item.summary}
            </Paragraph>
          )}
          <div style={{ display: 'flex', gap: 16, color: '#8F959E', fontSize: 12 }}>
            <span><EyeOutlined /> {item.viewCount}</span>
            <span><LikeOutlined /> {item.likeCount}</span>
            <span><MessageOutlined /> {item.commentCount}</span>
            <span><StarOutlined /> {item.favoriteCount}</span>
            <span>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </List.Item>
    )
  }

  const renderCommentItem = (item: CommentWithUser) => (
    <List.Item style={{ padding: '16px 0' }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text
            style={{ color: '#1677FF', cursor: 'pointer', fontSize: 13 }}
            onClick={() => navigate(`/post/${item.postId}`)}
          >
            回复帖子 #{item.postId}
          </Text>
          {item.status === CommentStatus.BLOCKED && <Tag color="red">已屏蔽</Tag>}
        </div>
        <Paragraph style={{ marginBottom: 4, fontSize: 14 }}>{item.content}</Paragraph>
        <div style={{ display: 'flex', gap: 16, color: '#8F959E', fontSize: 12 }}>
          <span><LikeOutlined /> {item.likeCount}</span>
          <span>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </List.Item>
  )

  const renderFavoriteItem = (item: PostListItem) => (
    <List.Item
      style={{ cursor: 'pointer', padding: '16px 0' }}
      onClick={() => navigate(`/post/${item.id}`)}
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
          <Tag color="blue">{item.categoryName}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 16, color: '#8F959E', fontSize: 12 }}>
          <span>作者: {item.author.nickname}</span>
          <span><EyeOutlined /> {item.viewCount}</span>
          <span><LikeOutlined /> {item.likeCount}</span>
          <span><MessageOutlined /> {item.commentCount}</span>
        </div>
      </div>
    </List.Item>
  )

  const tabItems = [
    {
      key: 'posts',
      label: `帖子 (${postsTotal})`,
      children: loading && activeTab === 'posts' ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : posts.length === 0 ? (
        <Empty description="暂无帖子" />
      ) : (
        <>
          <List dataSource={posts} renderItem={renderPostItem} split />
          {postsTotal > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={postsPage}
                total={postsTotal}
                pageSize={pageSize}
                onChange={(p) => fetchPosts(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: 'comments',
      label: `评论 (${commentsTotal})`,
      children: loading && activeTab === 'comments' ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : comments.length === 0 ? (
        <Empty description="暂无评论" />
      ) : (
        <>
          <List dataSource={comments} renderItem={renderCommentItem} split />
          {commentsTotal > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={commentsPage}
                total={commentsTotal}
                pageSize={pageSize}
                onChange={(p) => fetchComments(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: 'favorites',
      label: `收藏 (${favoritesTotal})`,
      children: loading && activeTab === 'favorites' ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : favorites.length === 0 ? (
        <Empty description="暂无收藏" />
      ) : (
        <>
          <List dataSource={favorites} renderItem={renderFavoriteItem} split />
          {favoritesTotal > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={favoritesPage}
                total={favoritesTotal}
                pageSize={pageSize}
                onChange={(p) => fetchFavorites(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ),
    },
  ]

  return (
    <Card style={{ marginTop: 24 }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </Card>
  )
}
