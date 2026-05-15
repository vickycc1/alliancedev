import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Divider, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect') || '/'

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate(redirect, { replace: true })
    } catch (err) {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleCasLogin = () => {
    window.location.href = '/api/auth/cas-login'
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
            企业级技术交流分享社区
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#8F959E' }} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8F959E' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Text
                style={{ color: '#1677FF', cursor: 'pointer', fontSize: 14 }}
              >
                忘记密码？
              </Text>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 40, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ color: '#8F959E', fontSize: 12 }}>其他登录方式</Divider>

        <Button
          icon={<SafetyCertificateOutlined />}
          block
          size="large"
          onClick={handleCasLogin}
          style={{ height: 40 }}
        >
          CAS 统一身份认证登录
        </Button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: '#8F959E' }}>
            还没有账号？
            <Link to="/register" style={{ color: '#1677FF', marginLeft: 4 }}>
              立即注册
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}
