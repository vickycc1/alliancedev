import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Switch, message, Typography, Spin } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'
import type { PostResponse } from '@/types/post'
import CategoryCascader from '@/components/CategoryCascader'
import RichEditor from '@/components/RichEditor'

const { Title } = Typography

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [aiRequested, setAiRequested] = useState(false)

  useEffect(() => {
    if (id) fetchPost()
  }, [id])

  const fetchPost = async () => {
    setFetching(true)
    try {
      const { data } = await request.get<Result<PostResponse>>(`/posts/${id}`)
      if (data.data) {
        form.setFieldsValue({
          title: data.data.title,
          categoryId: data.data.categoryId,
        })
        setContent(data.data.content)
        setAiRequested(data.data.aiRequested === 1)
      }
    } catch {
      message.error('获取帖子失败')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (values: { categoryId: number; title: string }) => {
    if (!content.trim()) {
      message.warning('请输入帖子内容')
      return
    }
    setLoading(true)
    try {
      await request.put(`/posts/${id}`, {
        categoryId: values.categoryId,
        title: values.title,
        content,
      })
      message.success('更新成功')
      navigate(`/post/${id}`)
    } catch {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Title level={3} style={{ margin: 0 }}>编辑帖子</Title>
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
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
                保存
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}
