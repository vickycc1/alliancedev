import { useParams, useNavigate } from 'react-router-dom'
import { AppstoreOutlined } from '@ant-design/icons'
import PostListPage from '@/pages/Home'
import { SortBy } from '@/types/common'

export default function Category() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryId = Number(id) || 0

  const handleCategoryChange = (newCategoryId: number) => {
    navigate(`/category/${newCategoryId}`, { replace: true })
  }

  return (
    <PostListPage
      key={categoryId}
      titleIcon={<AppstoreOutlined style={{ color: '#1677FF', fontSize: 24 }} />}
      defaultSortBy={SortBy.LATEST}
      defaultCategoryId={categoryId}
      onCategoryChange={handleCategoryChange}
    />
  )
}
