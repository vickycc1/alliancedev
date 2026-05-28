import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Switch, message, Typography } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'
import CategoryCascader from '@/components/CategoryCascader'
import RichEditor from '@/components/RichEditor'

const { Title } = Typography

export default function NewPost() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [aiRequested, setAiRequested] = useState(false)

  const handleSubmit = async (values: { categoryId: number; title: string }) => {
    if (!content.trim()) {
      message.warning('请输入帖子内容')
      return
    }
    setLoading(true)
    try {
      const { data } = await request.post<Result<number>>('/posts', {
        categoryId: values.categoryId,
        title: values.title,
        content,
        aiRequested,
      })
      if (data.data) {
        message.success('发布成功')
        navigate(`/post/${data.data}`)
      }
    } catch {
      message.error('发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Title level={3} style={{ margin: 0 }}>发布新帖</Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="标题"
            rules={[
              { required: true, message: '请输入标题' },
              { min: 2, message: '标题至少2个字符' },
              { max: 100, message: '标题最多100个字符' },
            ]}
          >
            <Input placeholder="请输入帖子标题" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="板块"
            rules={[{ required: true, message: '请选择板块' }]}
          >
            <CategoryCascader placeholder="选择所属板块" />
          </Form.Item>

          <Form.Item label="内容" required>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="请输入帖子内容，支持 Markdown 语法"
            />
          </Form.Item>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderTop: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#5A5A5A', fontSize: 14 }}>AI 智能回答</span>
              <Switch
                checked={aiRequested}
                onChange={setAiRequested}
                checkedChildren="开"
                unCheckedChildren="关"
              />
              <span style={{ color: '#8F959E', fontSize: 12 }}>
                开启后 AI 将自动生成帖子摘要和回答
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
                发布
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}
