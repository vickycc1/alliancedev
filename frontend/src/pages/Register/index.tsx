import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, SmileOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'
import type { RegisterRequest } from '@/types/user'

const { Title, Text } = Typography

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: RegisterRequest & { confirmPassword: string }) => {
    setLoading(true)
    try {
      await request.post<Result<void>>('/auth/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        nickname: values.nickname,
      } as RegisterRequest)
      message.success('注册成功，请登录')
      navigate('/login', { replace: true })
    } catch {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F2F3F5',
    }}>
      <div style={{
        width: 400,
        padding: '40px 32px',
        background: '#FFFFFF',
        borderRadius: 12,
        boxShadow: '0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1677FF', marginBottom: 8 }}>
            TechCommunity
          </Title>
          <Text style={{ color: '#8F959E', fontSize: 14 }}>
            创建账号，加入技术交流社区
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          size="large"
          autoComplete="off"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 50, message: '用户名最多50个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8F959E' }} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              { max: 50, message: '昵称最多50个字符' },
            ]}
          >
            <Input
              prefix={<SmileOutlined style={{ color: '#8F959E' }} />}
              placeholder="昵称"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#8F959E' }} />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { max: 50, message: '密码最多50个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8F959E' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8F959E' }} />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 40, fontSize: 16 }}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ color: '#8F959E' }}>
            已有账号？
            <Link to="/login" style={{ color: '#1677FF', marginLeft: 4 }}>
              立即登录
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}
