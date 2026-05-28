import { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import request from '@/api'
import type { Result } from '@/types/common'
import type { ChangePasswordRequest } from '@/types/user'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: ChangePasswordRequest) => {
    setLoading(true)
    try {
      await request.put<Result<void>>('/user/password', values)
      message.success('密码修改成功，请重新登录')
      form.resetFields()
      onClose()
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } catch {
      message.warning('该功能暂未开放，请联系管理员修改密码')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6个字符' },
            { max: 50, message: '密码最多50个字符' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
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
          <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
