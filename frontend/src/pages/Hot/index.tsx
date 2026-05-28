import { FireOutlined } from '@ant-design/icons'
import PostListPage from '@/pages/Home'
import { SortBy } from '@/types/common'

export default function Hot() {
  return (
    <PostListPage
      title="热门帖子"
      titleIcon={<FireOutlined style={{ color: '#F5222D', fontSize: 24 }} />}
      defaultSortBy={SortBy.HOTTEST}
      hideCategoryTabs
      hideSortSelect
    />
  )
}
