import { useState } from 'react'
import { Button, message } from 'antd'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import request from '@/api'

interface FavoriteButtonProps {
  postId: number
  favorited: boolean
  favoriteCount: number
  onFavoriteChange?: (favorited: boolean, count: number) => void
  size?: 'small' | 'middle' | 'large'
  text?: boolean
}

export default function FavoriteButton({
  postId,
  favorited,
  favoriteCount,
  onFavoriteChange,
  size = 'middle',
  text = true,
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await request.post('/favorites/toggle', { postId })
      const newFavorited = !favorited
      const newCount = newFavorited ? favoriteCount + 1 : favoriteCount - 1
      onFavoriteChange?.(newFavorited, newCount)
    } catch {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      icon={favorited ? <StarFilled /> : <StarOutlined />}
      onClick={handleToggle}
      loading={loading}
      size={size}
      style={favorited ? { color: '#faad14', borderColor: '#faad14' } : undefined}
    >
      {text && favoriteCount}
    </Button>
  )
}
