import { useState } from 'react'
import { Input, Button, Tooltip } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  LinkOutlined,
  PictureOutlined,
  AlignLeftOutlined,
} from '@ant-design/icons'

interface RichEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichEditor({ value = '', onChange, placeholder = '请输入内容...', minHeight = 400 }: RichEditorProps) {
  const [preview, setPreview] = useState(false)

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('.rich-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end)

    onChange?.(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
    }, 0)
  }

  const toolbarItems = [
    { icon: <BoldOutlined />, title: '粗体', action: () => insertMarkdown('**', '**') },
    { icon: <ItalicOutlined />, title: '斜体', action: () => insertMarkdown('*', '*') },
    { icon: <StrikethroughOutlined />, title: '删除线', action: () => insertMarkdown('~~', '~~') },
    { icon: <OrderedListOutlined />, title: '有序列表', action: () => insertMarkdown('1. ') },
    { icon: <UnorderedListOutlined />, title: '无序列表', action: () => insertMarkdown('- ') },
    { icon: <CodeOutlined />, title: '代码', action: () => insertMarkdown('`', '`') },
    { icon: <LinkOutlined />, title: '链接', action: () => insertMarkdown('[', '](url)') },
    { icon: <PictureOutlined />, title: '图片', action: () => insertMarkdown('![alt](', ')') },
    { icon: <AlignLeftOutlined />, title: '标题', action: () => insertMarkdown('## ') },
  ]

  const renderPreview = () => {
    return value.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h2 key={i} style={{ marginTop: 16 }}>{line.slice(2)}</h2>
      if (line.startsWith('## ')) return <h3 key={i} style={{ marginTop: 14 }}>{line.slice(3)}</h3>
      if (line.startsWith('### ')) return <h4 key={i} style={{ marginTop: 12 }}>{line.slice(4)}</h4>
      if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 16 }}>• {line.slice(2)}</div>
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) return <div key={i} style={{ paddingLeft: 16 }}>{line}</div>
      if (line.startsWith('`') && line.endsWith('`')) return <code key={i} style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{line.slice(1, -1)}</code>
      if (line.trim() === '') return <div key={i} style={{ height: 12 }} />
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      const italicProcessed = boldProcessed.replace(/\*(.*?)\*/g, '<em>$1</em>')
      return <p key={i} style={{ marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: italicProcessed }} />
    })
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 12px',
        background: '#FAFAFA',
        borderBottom: '1px solid #d9d9d9',
        flexWrap: 'wrap',
      }}>
        {toolbarItems.map((item, i) => (
          <Tooltip key={i} title={item.title}>
            <Button type="text" size="small" icon={item.icon} onClick={item.action} />
          </Tooltip>
        ))}
        <div style={{ flex: 1 }} />
        <Button
          type="text"
          size="small"
          onClick={() => setPreview(!preview)}
          style={{ color: preview ? '#1677FF' : undefined }}
        >
          {preview ? '编辑' : '预览'}
        </Button>
      </div>

      {preview ? (
        <div style={{
          minHeight,
          padding: '16px 20px',
          background: '#FFFFFF',
          lineHeight: 1.8,
          fontSize: 14,
        }}>
          {value ? renderPreview() : <span style={{ color: '#8F959E' }}>暂无内容</span>}
        </div>
      ) : (
        <Input.TextArea
          className="rich-editor-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight, resize: 'vertical', border: 'none', borderRadius: 0, padding: '16px 20px' }}
        />
      )}
    </div>
  )
}
