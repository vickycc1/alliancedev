import { useEffect, useState, useCallback } from 'react'
import {
  Table, Card, Input, Select, Button, Space, Tag, Modal, Descriptions, message, Tooltip,
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, EyeOutlined,
  StopOutlined, CheckCircleOutlined, EditOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getAdminUsers, getAdminUserDetail, updateUserStatus, updateUserRoles } from '@/api/admin'
import type { AdminUserQuery } from '@/types/admin'
import type { User } from '@/types/user'
import { UserStatus, RoleCode } from '@/types/common'

const userStatusMap: Record<number, { label: string; color: string }> = {
  [UserStatus.NORMAL]: { label: '正常', color: 'success' },
  [UserStatus.DISABLED]: { label: '禁用', color: 'error' },
  [UserStatus.MUTED]: { label: '禁言', color: 'warning' },
}

const roleLabelMap: Record<string, { label: string; color: string }> = {
  [RoleCode.ADMIN]: { label: '管理员', color: 'red' },
  [RoleCode.MODERATOR]: { label: '版主', color: 'blue' },
  [RoleCode.USER]: { label: '用户', color: 'default' },
}

export default function UserManage() {
  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<AdminUserQuery>({ page: 1, size: 10 })

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [roleVisible, setRoleVisible] = useState(false)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [roleLoading, setRoleLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await getAdminUsers(query)
      if (res.data) {
        setData(res.data.list)
        setTotal(res.data.total)
      }
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStatusChange = async (user: User) => {
    const newStatus = user.status === UserStatus.DISABLED ? UserStatus.NORMAL : UserStatus.DISABLED
    const action = newStatus === UserStatus.DISABLED ? '禁用' : '启用'
    Modal.confirm({
      title: `确认${action}用户`,
      content: `确定要${action}用户 "${user.nickname || user.username}" 吗？`,
      onOk: async () => {
        await updateUserStatus(user.id, newStatus)
        message.success(`${action}成功`)
        fetchData()
      },
    })
  }

  const handleViewDetail = async (user: User) => {
    setDetailVisible(true)
    setDetailLoading(true)
    try {
      const { data: res } = await getAdminUserDetail(user.id)
      if (res.data) setDetailUser(res.data)
    } catch {
      setDetailUser(user)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEditRole = (user: User) => {
    setRoleUser(user)
    setSelectedRoles(user.roles)
    setRoleVisible(true)
  }

  const handleRoleSubmit = async () => {
    if (!roleUser) return
    setRoleLoading(true)
    try {
      await updateUserRoles(roleUser.id, selectedRoles)
      message.success('角色修改成功')
      setRoleVisible(false)
      fetchData()
    } catch {
    } finally {
      setRoleLoading(false)
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 140,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 140,
      render: (val: string) => val || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      render: (val: string) => val || '-',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      render: (roles: string[]) => (
        <Space size={4}>
          {roles.map((r) => (
            <Tag key={r} color={roleLabelMap[r]?.color || 'default'}>
              {roleLabelMap[r]?.label || r}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: number) => {
        const m = userStatusMap[status]
        return <Tag color={m?.color || 'default'}>{m?.label || status}</Tag>
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title={record.status === UserStatus.DISABLED ? '启用' : '禁用'}>
            <Button
              type="link"
              size="small"
              danger={record.status !== UserStatus.DISABLED}
              icon={record.status === UserStatus.DISABLED ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => handleStatusChange(record)}
            />
          </Tooltip>
          <Tooltip title="修改角色">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRole(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
        <Space wrap size={12}>
          <Input
            placeholder="搜索用户名/邮箱"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 240 }}
            value={query.keyword || ''}
            onChange={(e) => setQuery((q) => ({ ...q, keyword: e.target.value || undefined, page: 1 }))}
            onPressEnter={fetchData}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140 }}
            value={query.status}
            onChange={(val) => setQuery((q) => ({ ...q, status: val, page: 1 }))}
            options={[
              { label: '正常', value: UserStatus.NORMAL },
              { label: '禁用', value: UserStatus.DISABLED },
              { label: '禁言', value: UserStatus.MUTED },
            ]}
          />
          <Select
            placeholder="角色筛选"
            allowClear
            style={{ width: 140 }}
            value={query.role}
            onChange={(val) => setQuery((q) => ({ ...q, role: val, page: 1 }))}
            options={[
              { label: '管理员', value: RoleCode.ADMIN },
              { label: '版主', value: RoleCode.MODERATOR },
              { label: '用户', value: RoleCode.USER },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: query.page,
            pageSize: query.size,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => setQuery((q) => ({ ...q, page, size })),
          }}
        />
      </Card>

      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
        loading={detailLoading}
      >
        {detailUser && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="ID">{detailUser.id}</Descriptions.Item>
            <Descriptions.Item label="用户名">{detailUser.username}</Descriptions.Item>
            <Descriptions.Item label="昵称">{detailUser.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailUser.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{detailUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={userStatusMap[detailUser.status]?.color}>
                {userStatusMap[detailUser.status]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="角色" span={2}>
              <Space size={4}>
                {detailUser.roles.map((r) => (
                  <Tag key={r} color={roleLabelMap[r]?.color}>{roleLabelMap[r]?.label}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {detailUser.createdAt ? dayjs(detailUser.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最后登录">
              {detailUser.lastLoginAt ? dayjs(detailUser.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="个人简介" span={2}>
              {detailUser.bio || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={`修改角色 - ${roleUser?.nickname || roleUser?.username}`}
        open={roleVisible}
        onOk={handleRoleSubmit}
        onCancel={() => setRoleVisible(false)}
        confirmLoading={roleLoading}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={selectedRoles}
          onChange={setSelectedRoles}
          options={[
            { label: '管理员 (ADMIN)', value: RoleCode.ADMIN },
            { label: '版主 (MODERATOR)', value: RoleCode.MODERATOR },
            { label: '用户 (USER)', value: RoleCode.USER },
          ]}
          placeholder="选择角色"
        />
      </Modal>
    </Space>
  )
}
