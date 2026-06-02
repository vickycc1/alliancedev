import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Steps, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'

const { Title, Text } = Typography

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [account, setAccount] = useState('')
  const [step1Form] = Form.useForm()
  const [step2Form] = Form.useForm()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = useCallback(async (values: { account: string }) => {
    setLoading(true)
    try {
      const { data: res } = await request.post<Result<string>>('/auth/forgot-password/send-code', null, {
        params: { account: values.account },
      })
      if (res.data) {
        message.success(`验证码已发送（开发模式）：${res.data}`, 10)
      } else {
        message.success('验证码已发送，请查看邮箱')
      }
      setAccount(values.account)
      setCountdown(60)
      setCurrent(1)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  const handleResetPassword = useCallback(async (values: { code: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true)
    try {
      await request.post<Result<void>>('/auth/forgot-password/reset', {
        account,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      message.success('密码重置成功，请使用新密码登录')
      setCurrent(2)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [account])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F2F3F5',
    }}>
      <div style={{
        width: 440,
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
            重置您的密码
          </Text>
        </div>

        <Steps
          current={current}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: '验证账号' },
            { title: '重置密码' },
            { title: '完成' },
          ]}
        />

        {current === 0 && (
          <Form
            form={step1Form}
            onFinish={handleSendCode}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="account"
              rules={[{ required: true, message: '请输入用户名或邮箱' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#8F959E' }} />}
                placeholder="用户名或邮箱"
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
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        )}

        {current === 1 && (
          <Form
            form={step2Form}
            onFinish={handleResetPassword}
            size="large"
            autoComplete="off"
          >
            <div style={{
              padding: '12px 16px',
              background: '#F6F8FA',
              borderRadius: 8,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#8F959E', fontSize: 13 }}>
                验证码已发送至 <Text strong>{account}</Text> 绑定的邮箱
              </Text>
            </div>

            <Form.Item
              name="code"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为6位' },
              ]}
            >
              <Input
                prefix={<SafetyCertificateOutlined style={{ color: '#8F959E' }} />}
                placeholder="6位验证码"
                maxLength={6}
              />
            </Form.Item>

            {countdown > 0 && (
              <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                <Text style={{ color: '#8F959E', fontSize: 13 }}>
                  {countdown}s 后可重新发送
                </Text>
              </div>
            )}

            {countdown === 0 && (
              <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                <Text
                  style={{ color: '#1677FF', fontSize: 13, cursor: 'pointer' }}
                  onClick={() => {
                    step1Form.validateFields(['account']).then((values) => {
                      handleSendCode(values)
                    })
                  }}
                >
                  重新发送验证码
                </Text>
              </div>
            )}

            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' },
                { max: 50, message: '密码最多50个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8F959E' }} />}
                placeholder="新密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8F959E' }} />}
                placeholder="确认新密码"
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
                重置密码
              </Button>
            </Form.Item>
          </Form>
        )}

        {current === 2 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#F6FFED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{ fontSize: 32, color: '#52C41A' }}>✓</span>
            </div>
            <Title level={4} style={{ marginBottom: 8 }}>密码重置成功</Title>
            <Text style={{ color: '#8F959E', display: 'block', marginBottom: 24 }}>
              您的密码已成功重置，请使用新密码登录
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/login', { replace: true })}
              style={{ height: 40, fontSize: 16, minWidth: 160 }}
            >
              前往登录
            </Button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid #F0F0F0', paddingTop: 16 }}>
          <Link to="/login" style={{ color: '#8F959E', fontSize: 14 }}>
            <ArrowLeftOutlined style={{ marginRight: 4 }} />
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}
