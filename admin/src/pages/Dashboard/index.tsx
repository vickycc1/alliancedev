import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Space, Tag, Spin } from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  FlagOutlined,
  CommentOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import { getAdminStats } from '@/api/admin'
import type { AdminStats } from '@/types/admin'

const { Title, Text } = Typography

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => {
        if (data.data) setStats(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      title: '总用户数',
      value: stats?.userTotal ?? 0,
      todayNew: stats?.userTodayNew ?? 0,
      icon: <UserOutlined style={{ fontSize: 24, color: '#4F46E5' }} />,
      suffix: '人',
    },
    {
      title: '帖子总数',
      value: stats?.postTotal ?? 0,
      todayNew: stats?.postTodayNew ?? 0,
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#059669' }} />,
      suffix: '篇',
    },
    {
      title: '评论总数',
      value: stats?.commentTotal ?? 0,
      todayNew: stats?.commentTodayNew ?? 0,
      icon: <CommentOutlined style={{ fontSize: 24, color: '#0891B2' }} />,
      suffix: '条',
    },
    {
      title: '待处理举报',
      value: stats?.reportPending ?? 0,
      todayNew: 0,
      icon: <FlagOutlined style={{ fontSize: 24, color: '#DC2626' }} />,
      suffix: '条',
    },
    {
      title: 'AI 调用次数',
      value: stats?.aiCallCount ?? 0,
      todayNew: 0,
      icon: <RobotOutlined style={{ fontSize: 24, color: '#7C3AED' }} />,
      suffix: '次',
    },
    {
      title: 'AI 成功率',
      value: stats?.aiSuccessRate ?? 0,
      todayNew: 0,
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#059669' }} />,
      suffix: '%',
    },
  ]

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            欢迎回来，{user?.nickname || user?.username}
          </Title>
          <Text type="secondary">以下是系统运行概况</Text>
        </div>

        <Row gutter={[24, 24]}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={card.title}>
              <Card
                hoverable
                style={{ borderRadius: 12 }}
                styles={{ body: { padding: 20 } }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{card.title}</Text>
                    {card.icon}
                  </div>
                  <Statistic
                    value={card.value}
                    suffix={card.suffix}
                    valueStyle={{ fontSize: 26, fontWeight: 700 }}
                  />
                  {card.todayNew > 0 && (
                    <div>
                      <Tag color="success" icon={<ArrowUpOutlined />} style={{ marginRight: 4 }}>
                        +{card.todayNew}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>今日</Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title="近7天活跃趋势"
              style={{ borderRadius: 12 }}
              styles={{ body: { minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
            >
              {stats?.activeTrend && stats.activeTrend.length > 0 ? (
                <Text type="secondary">趋势图渲染区域（接入 @ant-design/charts 后展示）</Text>
              ) : (
                <Text type="secondary">暂无趋势数据</Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title="快捷入口"
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {[
                  { label: '用户管理', count: stats?.userTotal, href: '/users' },
                  { label: '帖子管理', count: stats?.postTotal, href: '/posts' },
                  { label: '举报管理', count: stats?.reportPending, href: '/reports' },
                  { label: '系统配置', count: undefined, href: '/config' },
                ].map((item) => (
                  <div
                    key={item.href}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Text>{item.label}</Text>
                    {item.count !== undefined && (
                      <Tag color={item.label === '举报管理' ? 'error' : 'default'}>
                        {item.count}
                      </Tag>
                    )}
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </Spin>
  )
}
