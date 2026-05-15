import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Tag,
  Button,
  Spin,
  Avatar,
  Divider,
  message,
  Dropdown,
  Modal,
} from 'antd'
import {
  EyeOutlined,
  MessageOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FireOutlined,
  CrownOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'
import type { PostDetail } from '@/types/post'
import { useAuthStore } from '@/store/useAuthStore'
import { RoleCode, TargetType } from '@/types/common'
import LikeButton from '@/components/LikeButton'
import FavoriteButton from '@/components/FavoriteButton'
import ShareButton from '@/components/ShareButton'
import CommentList from '@/components/CommentList'
import AIReplyCard from '@/components/AIReplyCard'

const { Title, Text, Paragraph } = Typography

export default function Post() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchPost()
  }, [id])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PostDetail>>(`/posts/${id}`)
      if (data.data) setPost(data.data)
    } catch {
      message.error('获取帖子失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeChange = (liked: boolean, count: number) => {
    if (post) setPost({ ...post, liked, likeCount: count })
  }

  const handleFavoriteChange = (favorited: boolean, count: number) => {
    if (post) setPost({ ...post, favorited, favoriteCount: count })
  }

  const handleCommentCountChange = (count: number) => {
    if (post) setPost({ ...post, commentCount: count })
  }

  const handleReport = () => {
    Modal.confirm({
      title: '举报帖子',
      content: '确定要举报这篇帖子吗？',
      okText: '确定举报',
      cancelText: '取消',
      onOk: async () => {
        try {
          await request.post('/reports', { targetId: post?.id, targetType: TargetType.POST, reason: '内容违规' })
          message.success('举报成功，管理员将尽快处理')
        } catch {
          message.error('举报失败')
        }
      },
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '删除帖子',
      content: '确定要删除这篇帖子吗？此操作不可撤销。',
      okText: '确定删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await request.delete(`/posts/${post?.id}`)
          message.success('删除成功')
          navigate('/')
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  if (!post) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Text type="secondary">帖子不存在</Text></div>
  }

  const isAuthor = currentUser && currentUser.id === post.userId
  const isAdmin = currentUser?.roles.includes(RoleCode.ADMIN)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {post.isTop === 1 && <Tag icon={<FireOutlined />} color="red">置顶</Tag>}
          {post.isEssence === 1 && <Tag icon={<CrownOutlined />} color="gold">精华</Tag>}
          {post.aiRequested === 1 && <Tag icon={<RobotOutlined />} color="purple">AI</Tag>}
          <Tag color="blue">{post.categoryName}</Tag>
        </div>

        <Title level={2} style={{ marginBottom: 16 }}>{post.title}</Title>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={post.author.avatar} icon={undefined} size={36}>
              {post.author.nickname?.[0]}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 14 }}>{post.author.nickname}</Text>
              <div style={{ color: '#8F959E', fontSize: 12 }}>
                {new Date(post.createdAt).toLocaleString('zh-CN')}
                {post.updatedAt !== post.createdAt && ` · 编辑于 ${new Date(post.updatedAt).toLocaleString('zh-CN')}`}
              </div>
            </div>
          </div>
          {(isAuthor || isAdmin) && (
            <Dropdown
              menu={{
                items: [
                  ...(isAuthor ? [{ key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: () => navigate(`/edit-post/${post.id}`) }] : []),
                  ...(isAuthor || isAdmin ? [{ key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: handleDelete }] : []),
                ],
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </div>

        <Divider style={{ margin: '0 0 20px' }} />

        <div style={{ lineHeight: 1.8, fontSize: 15, color: '#1D2129' }}>
          {post.content.split('\n').map((paragraph, i) => {
            if (paragraph.startsWith('# ')) return <Title key={i} level={2} style={{ marginTop: 24 }}>{paragraph.slice(2)}</Title>
            if (paragraph.startsWith('## ')) return <Title key={i} level={3} style={{ marginTop: 20 }}>{paragraph.slice(3)}</Title>
            if (paragraph.startsWith('### ')) return <Title key={i} level={4} style={{ marginTop: 16 }}>{paragraph.slice(4)}</Title>
            if (paragraph.startsWith('```')) return null
            if (paragraph.startsWith('- ')) return <div key={i} style={{ paddingLeft: 16 }}>• {paragraph.slice(2)}</div>
            if (paragraph.trim() === '') return <div key={i} style={{ height: 12 }} />
            return <Paragraph key={i} style={{ marginBottom: 8 }}>{paragraph}</Paragraph>
          })}
        </div>

        <Divider style={{ margin: '24px 0 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <LikeButton
              targetId={post.id}
              targetType={TargetType.POST}
              liked={post.liked}
              likeCount={post.likeCount}
              onLikeChange={handleLikeChange}
            />
            <FavoriteButton
              postId={post.id}
              favorited={post.favorited}
              favoriteCount={post.favoriteCount}
              onFavoriteChange={handleFavoriteChange}
            />
            <Button icon={<MessageOutlined />}>{post.commentCount}</Button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ShareButton postId={post.id} title={post.title} />
            {!isAuthor && (
              <Button icon={<FlagOutlined />} onClick={handleReport}>举报</Button>
            )}
          </div>
        </div>

        <div style={{ color: '#8F959E', fontSize: 12, marginTop: 12 }}>
          <EyeOutlined style={{ marginRight: 4 }} />{post.viewCount} 次浏览
        </div>
      </Card>

      {post.aiRequested === 1 && (
        <AIReplyCard postId={post.id} aiRequested={post.aiRequested === 1} />
      )}

      <Card style={{ marginTop: 16 }}>
        <CommentList
          postId={post.id}
          commentCount={post.commentCount}
          onCommentCountChange={handleCommentCountChange}
        />
      </Card>
    </div>
  )
}
