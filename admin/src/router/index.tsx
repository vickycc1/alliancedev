import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { AdminGuard, GuestGuard } from './guards'
import AdminLayout from '@/components/Layout/AdminLayout'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const UserManage = lazy(() => import('@/pages/UserManage'))
const CategoryManage = lazy(() => import('@/pages/CategoryManage'))
const PostManage = lazy(() => import('@/pages/PostManage'))
const ReportManage = lazy(() => import('@/pages/ReportManage'))
const SystemConfig = lazy(() => import('@/pages/SystemConfig'))

function PageLoading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 300,
    }}>
      <Spin size="large" />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />

        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManage />} />
          <Route path="/categories" element={<CategoryManage />} />
          <Route path="/posts" element={<PostManage />} />
          <Route path="/reports" element={<ReportManage />} />
          <Route path="/config" element={<SystemConfig />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
