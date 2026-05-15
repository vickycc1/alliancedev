import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Tag,
  Spin,
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import request from '@/api'
import type { Result } from '@/types/common'
import type { User, UpdateProfileRequest } from '@/types/user'
import { UserStatus, RoleCode } from '@/types/common'
import { AvatarUpload } from '@/components/ImageUpload'
import ChangePasswordModal from './ChangePasswordModal'
import UserContentTabs from './UserContentTabs'

const { Title, Text, Paragraph } = Typography

const statusMap: Record<UserStatus, { label: string; color: string }> = {
  [UserStatus.NORMAL]: { label: '正常', color: 'green' },
  [UserStatus.DISABLED]: { label: '禁用', color: 'red' },
  [UserStatus.MUTED]: { label: '禁言', color: 'orange' },
}

const roleLabelMap: Record<string, string> = {
  [RoleCode.ADMIN]: '管理员',
  [RoleCode.MODERATOR]: '版主',
  [RoleCode.USER]: '用户',
}

export default function Profile() {
  const { id } = useParams()
  const currentUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const isSelf = !id || (currentUser && String(currentUser.id) === id)

  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  useEffect(() => {
    if (isSelf) {
      if (currentUser) {
        setProfileUser(currentUser)
        setLoading(false)
      } else {
        fetchProfile().then(() => {}).catch(() => {}).finally(() => {
          const user = useAuthStore.getState().user
          if (user) {
            setProfileUser(user)
          }
          setLoading(false)
        })
      }
    } else if (id) {
      fetchUserProfile(Number(id))
    }
  }, [id, isSelf])

  useEffect(() => {
    if (isSelf && currentUser && profileUser?.id === currentUser.id) {
      setProfileUser(currentUser)
    }
  }, [currentUser, isSelf, profileUser?.id])

  const fetchUserProfile = async (userId: number) => {
    setLoading(true)
    try {
      const { data } = await request.get<Result<User>>(`/user/${userId}`)
      if (data.data) {
        setProfileUser(data.data)
      }
    } catch {
      message.error('获取用户信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (!currentUser) return
    editForm.setFieldsValue({
      nickname: currentUser.nickname,
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      bio: currentUser.bio || '',
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (values: UpdateProfileRequest) => {
    setEditLoading(true)
    try {
      const { data } = await request.put<Result<User>>('/user/profile', values)
      if (data.data) {
        setUser(data.data)
        setProfileUser(data.data)
        message.success('更新成功')
        setEditModalOpen(false)
      }
    } catch {
      message.error('更新失败')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAvatarUploadSuccess = (url: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: url }
      setUser(updatedUser)
      setProfileUser(updatedUser)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Text type="secondary">用户不存在</Text>
      </div>
    )
  }

  const statusInfo = statusMap[profileUser.status]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {isSelf ? (
            <AvatarUpload
              src={profileUser.avatar}
              size={80}
              onUploadSuccess={handleAvatarUploadSuccess}
            />
          ) : (
            <Avatar size={80} src={profileUser.avatar} icon={<UserOutlined />} />
          )}
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ marginBottom: 4 }}>{profileUser.nickname}</Title>
            <Text type="secondary">@{profileUser.username}</Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
              {profileUser.roles.map((role) => (
                <Tag key={role} color="blue">{roleLabelMap[role] || role}</Tag>
              ))}
            </div>
          </div>
          {isSelf && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<EditOutlined />} onClick={handleEdit}>编辑资料</Button>
              <Button icon={<LockOutlined />} onClick={() => setPasswordModalOpen(true)}>修改密码</Button>
            </div>
          )}
        </div>
        {profileUser.bio && (
          <Paragraph style={{ marginTop: 16, color: '#5A5A5A' }}>{profileUser.bio}</Paragraph>
        )}
      </Card>

      <Card title="详细信息">
        <Descriptions column={1} labelStyle={{ width: 120, color: '#8F959E' }}>
          <Descriptions.Item label="用户名">{profileUser.username}</Descriptions.Item>
          <Descriptions.Item label="昵称">{profileUser.nickname}</Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {profileUser.email || <Text type="secondary">未设置</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="手机">
            {profileUser.phone || <Text type="secondary">未设置</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            <CalendarOutlined style={{ marginRight: 8 }} />
            {new Date(profileUser.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          {profileUser.lastLoginAt && (
            <Descriptions.Item label="最后登录">
              {new Date(profileUser.lastLoginAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <UserContentTabs userId={profileUser.id} />

      <Modal
        title="编辑个人资料"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={editLoading}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }, { max: 50, message: '昵称最多50个字符' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="个人简介"
            rules={[{ max: 200, message: '简介最多200个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="介绍一下自己吧" showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  )
}
