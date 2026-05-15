import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, AutoComplete, Space } from 'antd'
import { SearchOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result, PageResult } from '@/types/common'
import type { PostListItem } from '@/types/post'

interface HeaderSearchProps {
  style?: React.CSSProperties
}

export default function HeaderSearch({ style }: HeaderSearchProps) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [options, setOptions] = useState<Array<{ value: string; label: React.ReactNode }>>([])
  const [hotKeywords, setHotKeywords] = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    request.get<Result<string[]>>('/search/hot-keywords').then(({ data }) => {
      if (data.data) setHotKeywords(data.data)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const fetchSuggestions = (kw: string) => {
    if (!kw.trim()) {
      setOptions(buildDefaultOptions())
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      request.get<Result<PageResult<PostListItem>>>('/posts', {
        params: { keyword: kw, page: 1, size: 5 },
      }).then(({ data }) => {
        if (data.data?.list) {
          const items = data.data.list.map((post) => ({
            value: post.title,
            label: (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 280,
                }}>
                  {post.title}
                </span>
                <span style={{ color: '#8F959E', fontSize: 12, flexShrink: 0 }}>
                  {post.categoryName}
                </span>
              </div>
            ),
          }))
          setOptions(items)
        }
      })
    }, 300)
  }

  const buildDefaultOptions = () => {
    if (hotKeywords.length === 0) return []
    return [{
      value: '__hot__',
      label: (
        <div>
          <div style={{
            fontSize: 12,
            color: '#8F959E',
            marginBottom: 8,
            fontWeight: 500,
          }}>
            <FireOutlined style={{ color: '#F5222D', marginRight: 4 }} />
            热门搜索
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hotKeywords.map((kw) => (
              <span
                key={kw}
                style={{
                  padding: '2px 8px',
                  background: '#F2F3F5',
                  borderRadius: 4,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#1F2329',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setValue(kw)
                  navigate(`/search?q=${encodeURIComponent(kw)}`)
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ),
    }]
  }

  const handleSearch = (searchValue: string) => {
    const v = searchValue.trim()
    if (v) navigate(`/search?q=${encodeURIComponent(v)}`)
  }

  const handleSelect = (selected: string) => {
    if (selected === '__hot__') return
    navigate(`/search?q=${encodeURIComponent(selected)}`)
  }

  const handleFocus = () => {
    if (!value) setOptions(buildDefaultOptions())
  }

  return (
    <AutoComplete
      value={value}
      options={options}
      style={{ width: '100%', ...style }}
      onSelect={handleSelect}
      onSearch={(text) => {
        setValue(text)
        fetchSuggestions(text)
      }}
      onFocus={handleFocus}
    >
      <Input
        placeholder="搜索帖子、用户..."
        prefix={<SearchOutlined style={{ color: '#8F959E' }} />}
        style={{ borderRadius: 6 }}
        onPressEnter={() => handleSearch(value)}
        allowClear
      />
    </AutoComplete>
  )
}
