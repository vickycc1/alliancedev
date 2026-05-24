import { useState } from 'react'
import { Button, message } from 'antd'
import { LikeOutlined, LikeFilled } from '@ant-design/icons'
import { TargetType } from '@/types/common'
import request from '@/api'

interface LikeButtonProps {
  targetId: number
  targetType: TargetType
  liked: boolean
  likeCount: number
  onLikeChange?: (liked: boolean, count: number) => void
  size?: 'small' | 'middle' | 'large'
  text?: boolean
}

export default function LikeButton({
  targetId,
  targetType,
  liked,
  likeCount,
  onLikeChange,
  size = 'middle',
  text = true,
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await request.post('/interaction/like', { targetId, targetType })
      const newLiked = !liked
      const newCount = newLiked ? likeCount + 1 : likeCount - 1
      onLikeChange?.(newLiked, newCount)
    } catch {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type={liked ? 'primary' : 'default'}
      icon={liked ? <LikeFilled /> : <LikeOutlined />}
      onClick={handleToggle}
      loading={loading}
      size={size}
    >
      {text && likeCount}
    </Button>
  )
}
