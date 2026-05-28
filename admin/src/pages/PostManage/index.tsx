import { useEffect, useState, useCallback } from 'react'
import {
  Table, Card, Input, Select, Button, Space, Tag, Modal, Typography, message, Tooltip,
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, PushpinOutlined, FireOutlined,
  StopOutlined, SwapOutlined, DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  getAdminPosts, togglePostTop, togglePostEssence, blockPost, movePost, deletePost, getCategoryTree,
} from '@/api/admin'
import type { AdminPostQuery, PostListItem, CategoryTreeNode } from '@/types/admin'
import { PostStatus } from '@/types/common'

const { Text } = Typography

const postStatusMap: Record<number, { label: string; color: string }> = {
  [PostStatus.NORMAL]: { label: '正常', color: 'success' },
  [PostStatus.DRAFT]: { label: '草稿', color: 'default' },
  [PostStatus.BLOCKED]: { label: '已屏蔽', color: 'error' },
  [PostStatus.DELETED]: { label: '已删除', color: 'default' },
}

export default function PostManage() {
  const [data, setData] = useState<PostListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<AdminPostQuery>({ page: 1, size: 10 })

  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [moveVisible, setMoveVisible] = useState(false)
  const [movePostId, setMovePostId] = useState<number>(0)
  const [moveCategoryId, setMoveCategoryId] = useState<number | undefined>()
  const [moveLoading, setMoveLoading] = useState(false)

  const flatCategories = useCallback((nodes: CategoryTreeNode[]): Array<{ id: number; name: string }> => {
    const result: Array<{ id: number; name: string }> = []
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name })
      if (node.children) result.push(...flatCategories(node.children))
    }
    return result
  }, [])

  useEffect(() => {
    getCategoryTree().then(({ data: res }) => {
      if (res.data) setCategories(res.data)
    }).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await getAdminPosts(query)
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

  const handleToggleTop = async (record: PostListItem) => {
    try {
      await togglePostTop(record.id, !record.isTop)
      message.success(record.isTop ? '取消置顶成功' : '置顶成功')
      fetchData()
    } catch {}
  }

  const handleToggleEssence = async (record: PostListItem) => {
    try {
      await togglePostEssence(record.id, !record.isEssence)
      message.success(record.isEssence ? '取消加精成功' : '加精成功')
      fetchData()
    } catch {}
  }

  const handleBlock = (record: PostListItem) => {
    Modal.confirm({
      title: '确认屏蔽帖子',
      content: `确定要屏蔽帖子 "${record.title}" 吗？`,
      onOk: async () => {
        await blockPost(record.id)
        message.success('屏蔽成功')
        fetchData()
      },
    })
  }

  const handleMove = (record: PostListItem) => {
    setMovePostId(record.id)
    setMoveCategoryId(record.categoryId)
    setMoveVisible(true)
  }

  const handleMoveSubmit = async () => {
    if (!moveCategoryId) {
      message.warning('请选择目标板块')
      return
    }
    setMoveLoading(true)
    try {
      await movePost(movePostId, moveCategoryId)
      message.success('移动成功')
      setMoveVisible(false)
      fetchData()
    } catch {
    } finally {
      setMoveLoading(false)
    }
  }

  const handleDelete = (record: PostListItem) => {
    Modal.confirm({
      title: '确认删除帖子',
      content: `确定要删除帖子 "${record.title}" 吗？此操作为逻辑删除。`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deletePost(record.id)
          message.success('删除成功')
          setData((prev) => prev.filter((item) => item.id !== record.id))
          setTotal((prev) => prev - 1)
        } catch {
          message.error('删除失败，请稍后重试')
        }
      },
    })
  }

  const columns: ColumnsType<PostListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 240,
      ellipsis: true,
      render: (title: string, record) => (
        <Space size={4}>
          {record.isTop && <Tag color="blue" style={{ marginRight: 0 }}>置顶</Tag>}
          {record.isEssence && <Tag color="gold" style={{ marginRight: 0 }}>加精</Tag>}
          <Text>{title}</Text>
        </Space>
      ),
    },
    {
      title: '作者',
      dataIndex: 'authorName',
      width: 120,
    },
    {
      title: '板块',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => {
        const m = postStatusMap[status]
        return <Tag color={m?.color}>{m?.label}</Tag>
      },
    },
    {
      title: '浏览',
      dataIndex: 'viewCount',
      width: 80,
      sorter: true,
    },
    {
      title: '点赞',
      dataIndex: 'likeCount',
      width: 80,
    },
    {
      title: '评论',
      dataIndex: 'commentCount',
      width: 80,
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={record.isTop ? '取消置顶' : '置顶'}>
            <Button
              type="link"
              size="small"
              icon={<PushpinOutlined />}
              style={{ color: record.isTop ? '#4F46E5' : undefined }}
              onClick={() => handleToggleTop(record)}
            />
          </Tooltip>
          <Tooltip title={record.isEssence ? '取消加精' : '加精'}>
            <Button
              type="link"
              size="small"
              icon={<FireOutlined />}
              style={{ color: record.isEssence ? '#D97706' : undefined }}
              onClick={() => handleToggleEssence(record)}
            />
          </Tooltip>
          {record.status === PostStatus.NORMAL && (
            <Tooltip title="屏蔽">
              <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => handleBlock(record)} />
            </Tooltip>
          )}
          <Tooltip title="移动板块">
            <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => handleMove(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
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
            placeholder="搜索帖子标题"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 240 }}
            value={query.keyword || ''}
            onChange={(e) => setQuery((q) => ({ ...q, keyword: e.target.value || undefined, page: 1 }))}
            onPressEnter={fetchData}
          />
          <Select
            placeholder="板块筛选"
            allowClear
            style={{ width: 180 }}
            value={query.categoryId}
            onChange={(val) => setQuery((q) => ({ ...q, categoryId: val, page: 1 }))}
            options={flatCategories(categories).map((c) => ({ label: c.name, value: c.id }))}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140 }}
            value={query.status}
            onChange={(val) => setQuery((q) => ({ ...q, status: val, page: 1 }))}
            options={Object.entries(postStatusMap).map(([k, v]) => ({ label: v.label, value: Number(k) }))}
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
          scroll={{ x: 1400 }}
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
        title="移动帖子到板块"
        open={moveVisible}
        onOk={handleMoveSubmit}
        onCancel={() => setMoveVisible(false)}
        confirmLoading={moveLoading}
      >
        <Select
          style={{ width: '100%', marginTop: 16 }}
          placeholder="选择目标板块"
          value={moveCategoryId}
          onChange={setMoveCategoryId}
          options={flatCategories(categories).map((c) => ({ label: c.name, value: c.id }))}
        />
      </Modal>
    </Space>
  )
}
