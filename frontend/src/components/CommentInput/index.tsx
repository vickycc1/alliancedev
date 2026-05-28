import { useState } from 'react'
import { Input, Button, Avatar, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import request from '@/api'
import type { Result } from '@/types/common'
import type { CommentWithUser } from '@/types/comment'
import type { User } from '@/types/user'

const { TextArea } = Input

interface CommentInputProps {
  postId: number
  parentId?: number
  replyToUserId?: number
  replyToUser?: string
  placeholder?: string
  onSuccess?: (comment: CommentWithUser) => void
  onCancel?: () => void
}

export default function CommentInput({
  postId,
  parentId,
  replyToUserId,
  replyToUser,
  placeholder,
  onSuccess,
  onCancel,
}: CommentInputProps) {
  const currentUser = useAuthStore((s) => s.user)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const defaultPlaceholder = replyToUser
    ? `回复 ${replyToUser}...`
    : '写下你的评论...'

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请输入评论内容')
      return
    }
    setLoading(true)
    try {
      const body: Record<string, unknown> = { content, postId }
      if (parentId) body.parentId = parentId
      if (replyToUserId) body.replyToUserId = replyToUserId
      const { data } = await request.post<Result<number>>('/comments', body)
      if (data.data) {
        message.success('评论成功')
        setContent('')
        const optimisticComment: CommentWithUser = {
          id: data.data,
          postId,
          parentId: parentId || 0,
          content,
          likeCount: 0,
          status: 1,
          createdAt: new Date().toISOString(),
          author: {
            id: currentUser!.id,
            username: currentUser!.username,
            nickname: currentUser!.nickname,
            avatar: currentUser!.avatar,
            bio: currentUser!.bio,
            status: currentUser!.status,
            roles: currentUser!.roles,
            createdAt: currentUser!.createdAt,
            updatedAt: currentUser!.updatedAt,
          },
          liked: false,
          ...(replyToUserId ? { replyToUser: { id: replyToUserId, nickname: replyToUser, username: '', avatar: '', status: 1, roles: [], createdAt: '', updatedAt: '' } as User } : {}),
        }
        onSuccess?.(optimisticComment)
      }
    } catch {
      message.error('评论失败')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div style={{
        padding: '16px 20px',
        background: '#FAFAFA',
        borderRadius: 8,
        textAlign: 'center',
        color: '#8F959E',
      }}>
        请先登录后参与评论
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Avatar size={36} src={currentUser.avatar}>
        {currentUser.nickname?.[0]}
      </Avatar>
      <div style={{ flex: 1 }}>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {onCancel && (
            <Button size="small" onClick={onCancel}>取消</Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!content.trim()}
          >
            发布
          </Button>
        </div>
      </div>
    </div>
  )
}
