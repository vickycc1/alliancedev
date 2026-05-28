import { useState, useEffect, useRef } from 'react'
import { Card, Button, Typography, Tag, Spin, Skeleton, message, Space } from 'antd'
import { RobotOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'
import type { AiResponse } from '@/types/interaction'
import { AiResponseStatus } from '@/types/common'
import MDEditor from '@uiw/react-md-editor'

const { Text } = Typography

interface AIReplyCardProps {
  postId: number
  aiRequested: boolean
}

function TypewriterText({ content, speed = 30 }: { content: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')

    const timer = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= content.length) {
        setDisplayed(content)
        clearInterval(timer)
      } else {
        setDisplayed(content.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(timer)
  }, [content, speed])

  return (
    <div style={{ lineHeight: 1.8, fontSize: 14, color: '#1D2129' }}>
      {displayed}
      {displayed.length < content.length && (
        <span style={{
          display: 'inline-block',
          width: 2,
          height: 16,
          background: '#1677FF',
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'blink 1s infinite',
        }} />
      )}
      <style>{`@keyframes blink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }`}</style>
    </div>
  )
}

export default function AIReplyCard({ postId, aiRequested }: AIReplyCardProps) {
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showTypewriter, setShowTypewriter] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (aiRequested && postId) {
      fetchAiResponse()
    }
  }, [postId, aiRequested])

  const fetchAiResponse = async () => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<AiResponse>>(`/ai/posts/${postId}/response`)
      if (data.data) {
        setAiResponse(data.data)
        if (data.data.status === AiResponseStatus.COMPLETED && data.data.content) {
          setShowTypewriter(true)
        }
      }
    } catch {
      setAiResponse(null)
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    setShowTypewriter(false)
    try {
      const { data } = await request.post<Result<AiResponse>>(`/ai/posts/${postId}/retry`)
      if (data.data) {
        setAiResponse(data.data)
        if (data.data.status === AiResponseStatus.COMPLETED && data.data.content) {
          setShowTypewriter(true)
        }
        message.success('AI 回答已重新生成')
      }
    } catch {
      message.error('重新生成失败')
    } finally {
      setRegenerating(false)
    }
  }

  if (!aiRequested) return null

  if (loading && !fetched) {
    return (
      <Card
        style={{ marginBottom: 16, borderLeft: '3px solid #722ED1' }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <RobotOutlined style={{ color: '#722ED1', fontSize: 18 }} />
          <Text strong style={{ color: '#722ED1' }}>AI 智能回答</Text>
          <Tag color="purple" style={{ marginLeft: 4 }}>生成中</Tag>
        </div>
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      </Card>
    )
  }

  if (!aiResponse) return null

  const isGenerating = aiResponse.status === AiResponseStatus.GENERATING
  const isFailed = aiResponse.status === AiResponseStatus.FAILED
  const isCompleted = aiResponse.status === AiResponseStatus.COMPLETED

  return (
    <Card
      style={{ marginBottom: 16, borderLeft: '3px solid #722ED1' }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#722ED1', fontSize: 18 }} />
          <Text strong style={{ color: '#722ED1' }}>AI 智能回答</Text>
          {isCompleted && <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>}
          {isGenerating && <Tag icon={<LoadingOutlined spin />} color="processing">生成中</Tag>}
          {isFailed && <Tag icon={<CloseCircleOutlined />} color="error">生成失败</Tag>}
          {aiResponse.model && (
            <Text style={{ color: '#8F959E', fontSize: 12, marginLeft: 4 }}>
              {aiResponse.model}
            </Text>
          )}
        </div>
        <Space size={4}>
          {isCompleted && aiResponse.promptTokens && (
            <Text style={{ color: '#C9CDD4', fontSize: 11 }}>
              tokens: {aiResponse.promptTokens}/{aiResponse.completionTokens}
            </Text>
          )}
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined spin={regenerating} />}
            onClick={handleRegenerate}
            loading={regenerating}
            style={{ color: '#722ED1' }}
          >
            重新生成
          </Button>
        </Space>
      </div>

      {isGenerating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8F959E' }}>
          <Spin size="small" />
          <Text style={{ color: '#8F959E' }}>AI 正在思考中，请稍候...</Text>
        </div>
      )}

      {isFailed && (
        <div style={{ padding: '12px 16px', background: '#FFF2F0', borderRadius: 6, border: '1px solid #FFCCC7' }}>
          <Text style={{ color: '#CF1322' }}>
            生成失败：{aiResponse.errorMessage || '未知错误，请点击重新生成'}
          </Text>
        </div>
      )}

      {isCompleted && aiResponse.content && (
        <div style={{
          padding: '12px 16px',
          background: '#F9F0FF',
          borderRadius: 6,
          border: '1px solid #EFDBFF',
        }}>
          {showTypewriter ? (
            <TypewriterText content={aiResponse.content} speed={20} />
          ) : (
            <MDEditor.Markdown source={aiResponse.content} />
          )}
        </div>
      )}

      <div style={{ color: '#C9CDD4', fontSize: 11, marginTop: 8, textAlign: 'right' }}>
        生成于 {new Date(aiResponse.createdAt).toLocaleString('zh-CN')}
      </div>
    </Card>
  )
}
