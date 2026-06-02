import { useEffect, useState, useCallback } from 'react'
import {
  Card, Tabs, Form, Input, InputNumber, Button, Space, message, Spin, Table, Modal, Switch,
} from 'antd'
import {
  RobotOutlined, SafetyOutlined, ApiOutlined, ThunderboltOutlined, BellOutlined, PlusOutlined, DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  getSystemConfig, updateSystemConfig,
  getSensitiveWords, addSensitiveWord, deleteSensitiveWord, batchImportSensitiveWords,
} from '@/api/admin'
import type { AdminSystemConfig, SensitiveWord } from '@/types/admin'
import type { PageParams } from '@/types/common'

export default function SystemConfig() {
  const [, setConfig] = useState<AdminSystemConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [form] = Form.useForm()

  const [words, setWords] = useState<SensitiveWord[]>([])
  const [wordsTotal, setWordsTotal] = useState(0)
  const [wordsLoading, setWordsLoading] = useState(false)
  const [wordsQuery, setWordsQuery] = useState<PageParams & { keyword?: string }>({ page: 1, size: 20 })

  const [addWordVisible, setAddWordVisible] = useState(false)
  const [addWordValue, setAddWordValue] = useState('')
  const [addWordLoading, setAddWordLoading] = useState(false)

  const [batchVisible, setBatchVisible] = useState(false)
  const [batchValue, setBatchValue] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true)
    try {
      const { data: res } = await getSystemConfig()
      if (res.data) {
        setConfig(res.data)
        form.setFieldsValue(res.data)
      }
    } catch {
    } finally {
      setConfigLoading(false)
    }
  }, [form])

  const fetchWords = useCallback(async () => {
    setWordsLoading(true)
    try {
      const { data: res } = await getSensitiveWords(wordsQuery)
      if (res.data) {
        setWords(res.data.list)
        setWordsTotal(res.data.total)
      }
    } catch {
      setWords([])
    } finally {
      setWordsLoading(false)
    }
  }, [wordsQuery])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const handleSaveConfig = async () => {
    const values = await form.validateFields()
    setSaveLoading(true)
    try {
      await updateSystemConfig(values)
      message.success('配置保存成功')
    } catch {
    } finally {
      setSaveLoading(false)
    }
  }

  const handleAddWord = async () => {
    if (!addWordValue.trim()) {
      message.warning('请输入敏感词')
      return
    }
    setAddWordLoading(true)
    try {
      await addSensitiveWord(addWordValue.trim())
      message.success('添加成功')
      setAddWordVisible(false)
      setAddWordValue('')
      fetchWords()
    } catch {
    } finally {
      setAddWordLoading(false)
    }
  }

  const handleDeleteWord = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该敏感词吗？',
      onOk: async () => {
        await deleteSensitiveWord(id)
        message.success('删除成功')
        fetchWords()
      },
    })
  }

  const handleBatchImport = async () => {
    const wordsList = batchValue
      .split(/[\n,，;；]/)
      .map((w) => w.trim())
      .filter(Boolean)
    if (wordsList.length === 0) {
      message.warning('请输入敏感词')
      return
    }
    setBatchLoading(true)
    try {
      const { data: res } = await batchImportSensitiveWords(wordsList)
      if (res.data) {
        message.success(`成功导入 ${res.data.imported} 个敏感词`)
      }
      setBatchVisible(false)
      setBatchValue('')
      fetchWords()
    } catch {
    } finally {
      setBatchLoading(false)
    }
  }

  const wordColumns: ColumnsType<SensitiveWord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '敏感词',
      dataIndex: 'word',
      width: 200,
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteWord(record.id)} />
      ),
    },
  ]

  const tabItems = [
    {
      key: 'ai',
      label: (
        <Space><RobotOutlined /> AI 配置</Space>
      ),
      children: (
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item name="aiEnabled" label="启用 AI 回答" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
          <Form.Item name="aiBaseUrl" label="API Base URL" rules={[{ required: true, message: '请输入 API 地址' }]}>
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item name="aiApiKey" label="API Key" rules={[{ required: true, message: '请输入 API Key' }]}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="aiModel" label="模型" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input placeholder="gpt-4o-mini" />
          </Form.Item>
          <Form.Item name="aiTemperature" label="Temperature" initialValue={0.7}>
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="aiMaxTokens" label="Max Tokens" initialValue={2048}>
            <InputNumber min={100} max={8192} step={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'sensitive',
      label: (
        <Space><SafetyOutlined /> 敏感词管理</Space>
      ),
      children: (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddWordVisible(true)}>
              添加敏感词
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => setBatchVisible(true)}>
              批量导入
            </Button>
          </Space>
          <Table
            rowKey="id"
            columns={wordColumns}
            dataSource={words}
            loading={wordsLoading}
            size="small"
            pagination={{
              current: wordsQuery.page,
              pageSize: wordsQuery.size,
              total: wordsTotal,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (page, size) => setWordsQuery((q) => ({ ...q, page, size })),
            }}
          />
        </Space>
      ),
    },
    {
      key: 'cas',
      label: (
        <Space><ApiOutlined /> CAS 配置</Space>
      ),
      children: (
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item name="casServerUrl" label="CAS 服务器地址">
            <Input placeholder="https://cas.example.com/cas" />
          </Form.Item>
          <Form.Item name="casCallbackUrl" label="回调地址">
            <Input placeholder="https://community.example.com/api/auth/cas/callback" />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'rateLimit',
      label: (
        <Space><ThunderboltOutlined /> 限流配置</Space>
      ),
      children: (
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item name="postRateLimit" label="发帖频率限制（次/小时）" initialValue={10}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="commentRateLimit" label="评论频率限制（次/小时）" initialValue={30}>
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notification',
      label: (
        <Space><BellOutlined /> 通知配置</Space>
      ),
      children: (
        <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item name="notificationRetentionDays" label="通知保留天数" initialValue={30}>
            <InputNumber min={7} max={365} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Spin spinning={configLoading}>
      <Card
        title="系统配置"
        extra={
          <Button type="primary" loading={saveLoading} onClick={handleSaveConfig}>
            保存配置
          </Button>
        }
        style={{ borderRadius: 12 }}
      >
        <Tabs items={tabItems} />
      </Card>

      <Modal
        title="添加敏感词"
        open={addWordVisible}
        onOk={handleAddWord}
        onCancel={() => { setAddWordVisible(false); setAddWordValue('') }}
        confirmLoading={addWordLoading}
      >
        <Input
          placeholder="请输入敏感词"
          value={addWordValue}
          onChange={(e) => setAddWordValue(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>

      <Modal
        title="批量导入敏感词"
        open={batchVisible}
        onOk={handleBatchImport}
        onCancel={() => { setBatchVisible(false); setBatchValue('') }}
        confirmLoading={batchLoading}
      >
        <Input.TextArea
          rows={8}
          placeholder="每行一个敏感词，或用逗号/分号分隔"
          value={batchValue}
          onChange={(e) => setBatchValue(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </Spin>
  )
}
