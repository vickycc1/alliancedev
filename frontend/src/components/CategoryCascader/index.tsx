import { useState, useEffect } from 'react'
import { Cascader } from 'antd'
import type { DefaultOptionType } from 'antd/es/cascader'
import request from '@/api'
import type { Result } from '@/types/common'
import type { CategoryTree } from '@/types/category'

interface CategoryCascaderProps {
  value?: number
  onChange?: (value: number) => void
  placeholder?: string
}

function transformToOptions(categories: CategoryTree[]): DefaultOptionType[] {
  return categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    children: cat.children ? transformToOptions(cat.children) : undefined,
  }))
}

function flattenIds(categories: CategoryTree[]): number[] {
  const ids: number[] = []
  for (const cat of categories) {
    ids.push(cat.id)
    if (cat.children) ids.push(...flattenIds(cat.children))
  }
  return ids
}

export default function CategoryCascader({ value, onChange, placeholder = '选择板块' }: CategoryCascaderProps) {
  const [options, setOptions] = useState<DefaultOptionType[]>([])
  const [allIds, setAllIds] = useState<number[]>([])

  useEffect(() => {
    request.get<Result<CategoryTree[]>>('/categories/tree').then(({ data }) => {
      if (data.data) {
        setOptions(transformToOptions(data.data))
        setAllIds(flattenIds(data.data))
      }
    })
  }, [])

  const handleChange = (selectedValue: (string | number | null)[]) => {
    if (selectedValue.length > 0) {
      onChange?.(Number(selectedValue[selectedValue.length - 1]))
    } else {
      onChange?.(0)
    }
  }

  const findPath = (id: number, opts: DefaultOptionType[], path: number[] = []): number[] => {
    for (const opt of opts) {
      const currentPath = [...path, Number(opt.value)]
      if (Number(opt.value) === id) return currentPath
      if (opt.children) {
        const found = findPath(id, opt.children, currentPath)
        if (found.length > 0) return found
      }
    }
    return []
  }

  const cascaderValue = value && allIds.includes(value) ? findPath(value, options) : undefined

  return (
    <Cascader
      options={options}
      value={cascaderValue}
      onChange={handleChange}
      placeholder={placeholder}
      changeOnSelect
      style={{ width: '100%' }}
    />
  )
}
