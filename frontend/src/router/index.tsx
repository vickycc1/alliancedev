import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { AuthGuard, AdminGuard, GuestGuard } from './guards'
import MainLayout from '@/components/Layout/MainLayout'
import AdminLayout from '@/components/Layout/AdminLayout'

const Home = lazy(() => import('@/pages/Home'))
const Hot = lazy(() => import('@/pages/Hot'))
const Essence = lazy(() => import('@/pages/Essence'))
const Category = lazy(() => import('@/pages/Category'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Post = lazy(() => import('@/pages/Post'))
const NewPost = lazy(() => import('@/pages/NewPost'))
const EditPost = lazy(() => import('@/pages/EditPost'))
const Profile = lazy(() => import('@/pages/Profile'))
const Search = lazy(() => import('@/pages/Search'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))
const UserManage = lazy(() => import('@/pages/Admin/UserManage'))
const CategoryManage = lazy(() => import('@/pages/Admin/CategoryManage'))
const PostManage = lazy(() => import('@/pages/Admin/PostManage'))
const ReportManage = lazy(() => import('@/pages/Admin/ReportManage'))
const SystemConfig = lazy(() => import('@/pages/Admin/SystemConfig'))

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
        <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/hot" element={<Hot />} />
          <Route path="/essence" element={<Essence />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/new-post" element={<AuthGuard><NewPost /></AuthGuard>} />
          <Route path="/edit-post/:id" element={<AuthGuard><EditPost /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/profile/:id" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
          <Route path="/favorites" element={<AuthGuard><Favorites /></AuthGuard>} />
        </Route>

        <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManage />} />
          <Route path="/admin/categories" element={<CategoryManage />} />
          <Route path="/admin/posts" element={<PostManage />} />
          <Route path="/admin/reports" element={<ReportManage />} />
          <Route path="/admin/config" element={<SystemConfig />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
