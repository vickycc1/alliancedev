import { useEffect, useState, useCallback } from 'react'
import {
  Table, Card, Select, Button, Space, Tag, Modal, Descriptions, Typography, message, Tooltip, Input,
} from 'antd'
import {
  ReloadOutlined, StopOutlined, WarningOutlined, EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getAdminReports, getAdminReportDetail, handleReport } from '@/api/admin'
import type { AdminReportQuery, ReportListItem, AdminReportHandle } from '@/types/admin'
import { ReportStatus, TargetType } from '@/types/common'

const { Text, Paragraph } = Typography

const reportStatusMap: Record<number, { label: string; color: string }> = {
  [ReportStatus.PENDING]: { label: '待处理', color: 'warning' },
  [ReportStatus.BLOCKED]: { label: '已屏蔽', color: 'error' },
  [ReportStatus.IGNORED]: { label: '已忽略', color: 'default' },
  [ReportStatus.WARNED]: { label: '已警告', color: 'orange' },
}

const targetTypeMap: Record<number, string> = {
  [TargetType.POST]: '帖子',
  [TargetType.COMMENT]: '评论',
}

export default function ReportManage() {
  const [data, setData] = useState<ReportListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<AdminReportQuery>({ page: 1, size: 10 })

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState<ReportListItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [handleVisible, setHandleVisible] = useState(false)
  const [handleTarget, setHandleTarget] = useState<ReportListItem | null>(null)
  const [handleAction, setHandleAction] = useState<AdminReportHandle['action']>('IGNORE')
  const [handleReason, setHandleReason] = useState('')
  const [handleLoading, setHandleLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await getAdminReports(query)
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

  const handleViewDetail = async (record: ReportListItem) => {
    setDetailVisible(true)
    setDetailLoading(true)
    try {
      const { data: res } = await getAdminReportDetail(record.id)
      if (res.data) setDetailData(res.data)
    } catch {
      setDetailData(record)
    } finally {
      setDetailLoading(false)
    }
  }

  const openHandleModal = (record: ReportListItem, action: AdminReportHandle['action']) => {
    setHandleTarget(record)
    setHandleAction(action)
    setHandleReason('')
    setHandleVisible(true)
  }

  const submitHandle = async () => {
    if (!handleTarget) return
    setHandleLoading(true)
    try {
      await handleReport(handleTarget.id, { action: handleAction, reason: handleReason || undefined })
      message.success('处理成功')
      setHandleVisible(false)
      fetchData()
    } catch {
    } finally {
      setHandleLoading(false)
    }
  }

  const columns: ColumnsType<ReportListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '举报人',
      dataIndex: 'reporterName',
      width: 120,
    },
    {
      title: '举报目标',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tag>{targetTypeMap[record.targetType] || '未知'}</Tag>
          <Text>#{record.targetId}</Text>
        </Space>
      ),
    },
    {
      title: '目标标题',
      dataIndex: 'targetTitle',
      width: 200,
      ellipsis: true,
      render: (val: string) => val || '-',
    },
    {
      title: '举报原因',
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => {
        const m = reportStatusMap[status]
        return <Tag color={m?.color}>{m?.label}</Tag>
      },
    },
    {
      title: '举报时间',
      dataIndex: 'createdAt',
      width: 160,
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
          {record.status === ReportStatus.PENDING && (
            <>
              <Tooltip title="屏蔽内容">
                <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => openHandleModal(record, 'BLOCK')} />
              </Tooltip>
              <Tooltip title="警告用户">
                <Button type="link" size="small" icon={<WarningOutlined />} onClick={() => openHandleModal(record, 'WARN')} />
              </Tooltip>
              <Tooltip title="忽略举报">
                <Button type="link" size="small" onClick={() => openHandleModal(record, 'IGNORE')} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
        <Space wrap size={12}>
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140 }}
            value={query.status}
            onChange={(val) => setQuery((q) => ({ ...q, status: val, page: 1 }))}
            options={Object.entries(reportStatusMap).map(([k, v]) => ({ label: v.label, value: Number(k) }))}
          />
          <Select
            placeholder="举报类型"
            allowClear
            style={{ width: 140 }}
            value={query.targetType}
            onChange={(val) => setQuery((q) => ({ ...q, targetType: val, page: 1 }))}
            options={Object.entries(targetTypeMap).map(([k, v]) => ({ label: v, value: Number(k) }))}
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
        title="举报详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={640}
        loading={detailLoading}
      >
        {detailData && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="举报ID">{detailData.id}</Descriptions.Item>
            <Descriptions.Item label="举报人">{detailData.reporterName}</Descriptions.Item>
            <Descriptions.Item label="举报目标">
              {targetTypeMap[detailData.targetType] || '未知'} #{detailData.targetId}
            </Descriptions.Item>
            <Descriptions.Item label="目标标题">{detailData.targetTitle || '-'}</Descriptions.Item>
            <Descriptions.Item label="举报原因">{detailData.reason}</Descriptions.Item>
            <Descriptions.Item label="目标内容">
              <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}>
                {detailData.targetContent || '-'}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={reportStatusMap[detailData.status]?.color}>
                {reportStatusMap[detailData.status]?.label}
              </Tag>
            </Descriptions.Item>
            {detailData.status !== ReportStatus.PENDING && (
              <>
                <Descriptions.Item label="处理人">{detailData.handlerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="处理结果">{detailData.handleResult || '-'}</Descriptions.Item>
                <Descriptions.Item label="处理时间">
                  {detailData.handleTime ? dayjs(detailData.handleTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="举报时间">
              {dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={
          handleAction === 'BLOCK' ? '屏蔽内容' :
          handleAction === 'WARN' ? '警告用户' : '忽略举报'
        }
        open={handleVisible}
        onOk={submitHandle}
        onCancel={() => setHandleVisible(false)}
        confirmLoading={handleLoading}
        okButtonProps={{ danger: handleAction === 'BLOCK' }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 16 }}>
          <Text>
            {handleAction === 'BLOCK' && '屏蔽后该内容将对所有用户不可见，确认屏蔽？'}
            {handleAction === 'WARN' && '将向被举报用户发送警告通知，确认警告？'}
            {handleAction === 'IGNORE' && '忽略此举报，内容将保持正常展示，确认忽略？'}
          </Text>
          <Input.TextArea
            rows={3}
            placeholder="处理原因（可选）"
            value={handleReason}
            onChange={(e) => setHandleReason(e.target.value)}
          />
        </Space>
      </Modal>
    </Space>
  )
}
