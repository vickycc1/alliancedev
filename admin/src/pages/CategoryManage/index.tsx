import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Card, Tree, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, Typography, message, Empty, Spin,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, AppstoreOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '@/api/admin'
import type { CategoryTreeNode, AdminCategoryCreate, AdminCategoryUpdate } from '@/types/admin'
import { CategoryStatus } from '@/types/common'

const { Text } = Typography

const statusMap: Record<number, { label: string; color: string }> = {
  [CategoryStatus.ENABLED]: { label: '启用', color: 'success' },
  [CategoryStatus.DISABLED]: { label: '禁用', color: 'error' },
}

function buildTreeData(nodes: CategoryTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: (
      <Space size={8}>
        <Text strong>{node.name}</Text>
        <Tag color={statusMap[node.status]?.color}>{statusMap[node.status]?.label}</Tag>
        <Tag>{node.postCount} 帖</Tag>
        {node.description && <Text type="secondary" style={{ fontSize: 12 }}>{node.description}</Text>}
      </Space>
    ),
    children: node.children ? buildTreeData(node.children) : undefined,
  }))
}

function flattenCategories(nodes: CategoryTreeNode[], depth = 0): Array<CategoryTreeNode & { depth: number }> {
  const result: Array<CategoryTreeNode & { depth: number }> = []
  for (const node of nodes) {
    result.push({ ...node, depth })
    if (node.children) {
      result.push(...flattenCategories(node.children, depth + 1))
    }
  }
  return result
}

export default function CategoryManage() {
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<CategoryTreeNode | null>(null)
  const selectedIdRef = useRef<number | null>(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalLoading, setModalLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await getCategoryTree()
      if (res.data) {
        setTreeData(res.data)
        if (selectedIdRef.current) {
          const updated = flattenCategories(res.data).find((c) => c.id === selectedIdRef.current)
          setSelectedNode(updated || null)
        }
      }
    } catch {
      setTreeData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const flatList = flattenCategories(treeData)
  const parentOptions = flatList
    .filter((c) => c.depth < 2)
    .map((c) => ({ label: `${'—'.repeat(c.depth)} ${c.name}`, value: c.id }))

  const handleCreate = (parentId?: number) => {
    setModalMode('create')
    form.resetFields()
    if (parentId) form.setFieldsValue({ parentId })
    setModalVisible(true)
  }

  const handleEdit = () => {
    if (!selectedNode) return
    setModalMode('edit')
    form.setFieldsValue({
      name: selectedNode.name,
      description: selectedNode.description,
      sortOrder: selectedNode.sortOrder,
      status: selectedNode.status,
    })
    setModalVisible(true)
  }

  const handleDelete = () => {
    if (!selectedNode) return
    Modal.confirm({
      title: '确认删除板块',
      content: (
        <div>
          <p>确定要删除板块 "{selectedNode.name}" 吗？</p>
          {selectedNode.children && selectedNode.children.length > 0 && (
            <p style={{ color: '#DC2626' }}>该板块下有子板块，需先处理子板块！</p>
          )}
        </div>
      ),
      onOk: async () => {
        await deleteCategory(selectedNode.id)
        message.success('删除成功')
        selectedIdRef.current = null
        setSelectedNode(null)
        fetchTree()
      },
    })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        await createCategory(values as AdminCategoryCreate)
        message.success('创建成功')
      } else if (selectedNode) {
        await updateCategory(selectedNode.id, values as AdminCategoryUpdate)
        message.success('更新成功')
      }
      setModalVisible(false)
      fetchTree()
    } catch {
    } finally {
      setModalLoading(false)
    }
  }

  const handleSelect = (_: unknown, info: { node: { key: React.Key } }) => {
    const node = flatList.find((c) => c.id === Number(info.node.key))
    selectedIdRef.current = node?.id ?? null
    setSelectedNode(node || null)
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>板块管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
              新增板块
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchTree}>刷新</Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Spin spinning={loading}>
          {treeData.length > 0 ? (
            <Tree
              showLine
              defaultExpandAll
              treeData={buildTreeData(treeData)}
              onSelect={handleSelect}
              style={{ fontSize: 14 }}
            />
          ) : (
            <Empty description="暂无板块数据" />
          )}
        </Spin>
      </Card>

      {selectedNode && (
        <Card
          title={`板块详情 - ${selectedNode.name}`}
          style={{ borderRadius: 12 }}
          extra={
            <Space>
              <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                disabled={!!selectedNode.children?.length}
              >
                删除
              </Button>
              {(selectedNode.depth ?? 0) < 2 && (
                <Button icon={<PlusOutlined />} onClick={() => handleCreate(selectedNode.id)}>
                  添加子板块
                </Button>
              )}
            </Space>
          }
        >
          <Space direction="vertical" size={8}>
            <div><Text type="secondary">ID：</Text><Text>{selectedNode.id}</Text></div>
            <div><Text type="secondary">名称：</Text><Text strong>{selectedNode.name}</Text></div>
            <div>
              <Text type="secondary">状态：</Text>
              <Tag color={statusMap[selectedNode.status]?.color}>{statusMap[selectedNode.status]?.label}</Tag>
            </div>
            <div><Text type="secondary">排序值：</Text><Text>{selectedNode.sortOrder}</Text></div>
            <div><Text type="secondary">帖子数：</Text><Text>{selectedNode.postCount}</Text></div>
            <div><Text type="secondary">描述：</Text><Text>{selectedNode.description || '-'}</Text></div>
          </Space>
        </Card>
      )}

      <Modal
        title={modalMode === 'create' ? '新增板块' : '编辑板块'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {modalMode === 'create' && (
            <Form.Item name="parentId" label="父板块">
              <Select
                allowClear
                placeholder="无（顶级板块）"
                options={parentOptions}
              />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="板块名称"
            rules={[{ required: true, message: '请输入板块名称' }, { max: 50, message: '名称最长50字' }]}
          >
            <Input placeholder="请输入板块名称" />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ max: 200, message: '描述最长200字' }]}>
            <Input.TextArea rows={3} placeholder="板块描述（可选）" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序值" initialValue={0}>
            <InputNumber min={0} max={9999} style={{ width: '100%' }} placeholder="越小越靠前" />
          </Form.Item>
          {modalMode === 'edit' && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: '启用', value: CategoryStatus.ENABLED },
                  { label: '禁用', value: CategoryStatus.DISABLED },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  )
}
