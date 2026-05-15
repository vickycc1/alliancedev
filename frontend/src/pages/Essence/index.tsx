import { StarOutlined } from '@ant-design/icons'
import PostListPage from '@/pages/Home'
import { SortBy } from '@/types/common'

export default function Essence() {
  return (
    <PostListPage
      title="精华帖子"
      titleIcon={<StarOutlined style={{ color: '#FAAD14', fontSize: 24 }} />}
      defaultSortBy={SortBy.LATEST}
      defaultIsEssence
    />
  )
}
