import MDEditor from '@uiw/react-md-editor'

interface RichEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichEditor({ value = '', onChange, placeholder = '请输入内容，支持 Markdown 语法...', minHeight = 400 }: RichEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || '')}
        height={minHeight}
        preview="live"
        visibleDragbar={false}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  )
}
