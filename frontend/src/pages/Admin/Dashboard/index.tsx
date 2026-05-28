import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, message } from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  RiseOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  todayNewUsers: number
  todayNewPosts: number
  todayNewComments: number
  pendingReports: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: resData } = await request.get<Result<DashboardStats>>('/admin/stats')
        if (resData.data) {
          setStats(resData.data)
        }
      } catch {
        message.error('获取统计数据失败，请刷新重试')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers ?? 0}
              prefix={<UserOutlined />}
              loading={loading}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总帖子数"
              value={stats?.totalPosts ?? 0}
              prefix={<FileTextOutlined />}
              loading={loading}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={stats?.totalComments ?? 0}
              prefix={<CommentOutlined />}
              loading={loading}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理举报"
              value={stats?.pendingReports ?? 0}
              prefix={<FlagOutlined />}
              loading={loading}
              valueStyle={{ color: '#FF4D4F' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日新增用户"
              value={stats?.todayNewUsers ?? 0}
              prefix={<RiseOutlined />}
              loading={loading}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日新增帖子"
              value={stats?.todayNewPosts ?? 0}
              prefix={<RiseOutlined />}
              loading={loading}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日新增评论"
              value={stats?.todayNewComments ?? 0}
              prefix={<RiseOutlined />}
              loading={loading}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
