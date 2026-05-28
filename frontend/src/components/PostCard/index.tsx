import { Tag, Typography } from 'antd'
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  RobotOutlined,
  HeartFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { PostListItem } from '@/types/post'
import { PostStatus } from '@/types/common'

const { Text, Paragraph } = Typography

interface PostCardProps {
  post: PostListItem
}

const HOT_THRESHOLD = 50

const statusTagMap: Record<number, { label: string; color: string }> = {
  [PostStatus.DRAFT]: { label: '草稿', color: 'default' },
  [PostStatus.NORMAL]: { label: '', color: '' },
  [PostStatus.BLOCKED]: { label: '已屏蔽', color: 'red' },
  [PostStatus.DELETED]: { label: '已删除', color: 'default' },
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/post/${post.id}`)
  }

  const hotScore = (post.viewCount || 0) * 1 + (post.likeCount || 0) * 3 + (post.commentCount || 0) * 5 + (post.favoriteCount || 0) * 2
  const isHot = hotScore >= HOT_THRESHOLD

  const statusTag = statusTagMap[post.status]

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '20px 24px',
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E6EB',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        marginBottom: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.09)'
        e.currentTarget.style.borderColor = '#1677FF'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#E5E6EB'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {post.favorited && (
          <Tag icon={<HeartFilled />} color="magenta">已收藏</Tag>
        )}
        {isHot && !post.isTop && (
          <Tag icon={<FireOutlined />} color="orange">热门</Tag>
        )}
        {post.isTop === 1 && (
          <Tag icon={<FireOutlined />} color="red">置顶</Tag>
        )}
        {post.isEssence === 1 && (
          <Tag icon={<CrownOutlined />} color="gold">精华</Tag>
        )}
        {post.aiRequested === 1 && (
          <Tag icon={<RobotOutlined />} color="purple">AI</Tag>
        )}
        {statusTag && statusTag.label && (
          <Tag color={statusTag.color}>{statusTag.label}</Tag>
        )}
        <Tag color="blue" style={{ marginLeft: 'auto' }}>{post.categoryName}</Tag>
      </div>

      <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 6 }}>
        {isHot && <FireOutlined style={{ color: '#F5222D', marginRight: 6 }} />}
        {post.title}
      </Text>

      {post.summary && (
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ color: '#5A5A5A', marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}
        >
          {post.summary}
        </Paragraph>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text style={{ color: '#1677FF', fontSize: 13, cursor: 'pointer' }}>
            {post.author.nickname}
          </Text>
          <Text style={{ color: '#8F959E', fontSize: 12 }}>
            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 16, color: '#8F959E', fontSize: 13 }}>
          <span><EyeOutlined /> {post.viewCount}</span>
          <span><LikeOutlined /> {post.likeCount}</span>
          <span><MessageOutlined /> {post.commentCount}</span>
          <span><StarOutlined /> {post.favoriteCount}</span>
        </div>
      </div>
    </div>
  )
}
