import { useState, useEffect } from 'react'
import { Avatar, Button, Typography, Spin, Empty, Divider, message, Modal, Pagination, Radio, Input } from 'antd'
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  DeleteOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import request from '@/api'
import type { Result, PageResult, TargetType } from '@/types/common'
import type { CommentWithUser } from '@/types/comment'
import { useAuthStore } from '@/store/useAuthStore'
import { RoleCode, TargetType as TType } from '@/types/common'
import CommentInput from '@/components/CommentInput'

const { Text, Paragraph } = Typography

interface CommentListProps {
  postId: number
  commentCount: number
  onCommentCountChange?: (count: number) => void
}

function CommentItem({
  comment,
  postId,
  onDelete,
  depth = 0,
}: {
  comment: CommentWithUser
  postId: number
  onDelete: (id: number) => void
  depth?: number
}) {
  const currentUser = useAuthStore((s) => s.user)
  const [liked, setLiked] = useState(comment.liked)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [liking, setLiking] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyToUser, setReplyToUser] = useState<{ id: number; nickname: string } | null>(null)
  const [children, setChildren] = useState<CommentWithUser[]>(comment.children || [])
  const [reportVisible, setReportVisible] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  const isAuthor = currentUser && currentUser.id === comment.author.id
  const isAdmin = currentUser?.roles.includes(RoleCode.ADMIN)

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      await request.post('/interaction/like', { targetId: comment.id, targetType: 2 as TargetType })
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch {
      message.error('操作失败')
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '删除评论',
      content: '确定要删除这条评论吗？',
      okText: '确定',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await request.delete(`/comments/${comment.id}`)
          message.success('删除成功')
          onDelete(comment.id)
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const handleReplySuccess = (newComment: CommentWithUser) => {
    setChildren([...children, newComment])
    setShowReplyInput(false)
  }

  const submitReport = async () => {
    if (!reportReason.trim()) {
      message.warning('请选择或输入举报原因')
      return
    }
    setReportLoading(true)
    try {
      await request.post('/interaction/report', {
        targetId: comment.id,
        targetType: TType.COMMENT,
        reason: reportReason,
      })
      message.success('举报成功，管理员将尽快处理')
      setReportVisible(false)
    } catch {
      message.error('举报失败')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: depth === 0 ? 0 : 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar size={32} src={comment.author.avatar}>
          {comment.author.nickname?.[0]}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{ fontSize: 13 }}>{comment.author.nickname}</Text>
            {comment.replyToUser && (
              <>
                <Text style={{ color: '#8F959E', fontSize: 12 }}>回复</Text>
                <Text style={{ color: '#1677FF', fontSize: 13 }}>{comment.replyToUser.nickname}</Text>
              </>
            )}
            <Text style={{ color: '#8F959E', fontSize: 12, marginLeft: 'auto' }}>
              {new Date(comment.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
            </Text>
          </div>

          <Paragraph style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.6 }}>
            {comment.content}
          </Paragraph>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button
              type="text"
              size="small"
              icon={liked ? <LikeFilled style={{ color: '#1677FF' }} /> : <LikeOutlined />}
              onClick={handleLike}
              loading={liking}
              style={{ padding: '0 4px', fontSize: 12, color: liked ? '#1677FF' : '#8F959E' }}
            >
              {likeCount > 0 && likeCount}
            </Button>
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => {
                setReplyToUser({ id: comment.author.id, nickname: comment.author.nickname })
                setShowReplyInput(true)
              }}
              style={{ padding: '0 4px', fontSize: 12, color: '#8F959E' }}
            >
              回复
            </Button>
            {(isAuthor || isAdmin) && (
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                style={{ padding: '0 4px', fontSize: 12, color: '#8F959E' }}
              />
            )}
            {!isAuthor && (
              <Button
                type="text"
                size="small"
                icon={<FlagOutlined />}
                onClick={() => { setReportReason(''); setReportVisible(true) }}
                style={{ padding: '0 4px', fontSize: 12, color: '#8F959E' }}
              />
            )}
          </div>

          {showReplyInput && (
            <div style={{ marginTop: 12 }}>
              <CommentInput
                postId={postId}
                parentId={comment.id}
                replyToUserId={replyToUser?.id}
                replyToUser={replyToUser?.nickname}
                onSuccess={handleReplySuccess}
                onCancel={() => { setShowReplyInput(false); setReplyToUser(null) }}
              />
            </div>
          )}

          <Modal
            title="举报评论"
            open={reportVisible}
            onOk={submitReport}
            onCancel={() => setReportVisible(false)}
            confirmLoading={reportLoading}
            okText="提交举报"
            okButtonProps={{ danger: true }}
          >
            <Radio.Group
              onChange={(e) => setReportReason(e.target.value)}
              value={reportReason}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}
            >
              <Radio value="垃圾广告">垃圾广告</Radio>
              <Radio value="虚假信息">虚假信息</Radio>
              <Radio value="违法违规">违法违规</Radio>
              <Radio value="人身攻击">人身攻击</Radio>
              <Radio value="内容违规">内容违规</Radio>
              <Radio value="其他">其他</Radio>
            </Radio.Group>
            {reportReason === '其他' && (
              <Input.TextArea
                rows={3}
                placeholder="请输入举报原因"
                style={{ marginTop: 12 }}
                onChange={(e) => setReportReason(e.target.value)}
              />
            )}
          </Modal>

          {children.length > 0 && (
            <div style={{
              marginTop: 12,
              paddingLeft: 12,
              borderLeft: '2px solid #F0F0F0',
            }}>
              {children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  postId={postId}
                  onDelete={(id) => {
                    setChildren(children.filter((c) => c.id !== id))
                    onDelete(id)
                  }}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentList({ postId, commentCount, onCommentCountChange }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 10

  useEffect(() => {
    fetchComments()
  }, [page])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<PageResult<CommentWithUser>>>(
        `/comments/post/${postId}`,
        { params: { page, size: pageSize } },
      )
      if (data.data) {
        setComments(data.data.list)
        setTotal(data.data.total)
      }
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSuccess = (newComment: CommentWithUser) => {
    if (newComment.parentId === 0) {
      setComments([newComment, ...comments])
      setTotal(total + 1)
    } else {
      setComments(comments.map((c) => {
        if (c.id === newComment.parentId) {
          return { ...c, children: [...(c.children || []), newComment] }
        }
        return c
      }))
      setTotal(total + 1)
    }
    onCommentCountChange?.(commentCount + 1)
  }

  const handleDelete = (id: number) => {
    setComments(comments.filter((c) => c.id !== id))
    setTotal(total - 1)
    onCommentCountChange?.(commentCount - 1)
  }

  return (
    <div>
      <Divider orientation="left" style={{ marginTop: 0 }}>
        评论 ({commentCount})
      </Divider>

      <div style={{ marginBottom: 24 }}>
        <CommentInput
          postId={postId}
          placeholder="写下你的评论..."
          onSuccess={handleCommentSuccess}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : comments.length === 0 ? (
        <Empty description="暂无评论，快来抢沙发" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {total > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                simple
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
