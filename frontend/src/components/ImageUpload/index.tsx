import { useState } from 'react'
import { Avatar, Upload, message, Modal } from 'antd'
import { UserOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons'
import request from '@/api'
import type { Result } from '@/types/common'

interface AvatarUploadProps {
  src?: string
  size?: number
  uploadUrl?: string
  fieldName?: string
  onUploadSuccess?: (url: string) => void
}

export function AvatarUpload({
  src,
  size = 80,
  uploadUrl = '/user/avatar',
  fieldName = 'avatar',
  onUploadSuccess,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB')
      return false
    }

    setUploading(true)
    const formData = new FormData()
    formData.append(fieldName, file)
    try {
      const { data } = await request.post<Result<{ url: string }>>(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.data) {
        onUploadSuccess?.(data.data.url)
        message.success('上传成功')
      }
    } catch {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
    return false
  }

  return (
    <Upload
      accept="image/*"
      showUploadList={false}
      beforeUpload={(file) => {
        handleUpload(file)
        return false
      }}
    >
      <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
        <Avatar
          size={size}
          src={src}
          icon={<UserOutlined />}
          style={{ opacity: uploading ? 0.5 : 1 }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.45)',
          borderRadius: `0 0 ${size / 2}px ${size / 2}px`,
          textAlign: 'center',
          padding: '2px 0',
        }}>
          <UploadOutlined style={{ color: '#fff', fontSize: Math.max(10, size / 7) }} />
        </div>
      </div>
    </Upload>
  )
}

interface ImageUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxCount?: number
  uploadUrl?: string
  fieldName?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxCount = 3,
  uploadUrl = '/upload/image',
  fieldName = 'file',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件')
      return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB')
      return false
    }

    setUploading(true)
    const formData = new FormData()
    formData.append(fieldName, file)
    try {
      const { data } = await request.post<Result<{ url: string }>>(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.data) {
        const newUrls = [...value, data.data.url]
        onChange?.(newUrls)
      }
    } catch {
      message.error('上传失败')
    } finally {
      setUploading(false)
    }
    return false
  }

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange?.(newUrls)
  }

  const handlePreview = (url: string) => {
    Modal.info({
      title: '图片预览',
      content: <img src={url} alt="preview" style={{ width: '100%', marginTop: 8 }} />,
      okText: '关闭',
      width: 520,
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {value.map((url, index) => (
        <div
          key={url}
          style={{
            width: 104,
            height: 104,
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #d9d9d9',
          }}
        >
          <img
            src={url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => handlePreview(url)}
          />
          <div
            onClick={() => handleRemove(index)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 20,
              height: 20,
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            ×
          </div>
        </div>
      ))}
      {value.length < maxCount && (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file)
            return false
          }}
        >
          <div style={{
            width: 104,
            height: 104,
            borderRadius: 8,
            border: '1px dashed #d9d9d9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.3s',
            opacity: uploading ? 0.5 : 1,
          }}>
            <PlusOutlined style={{ fontSize: 24, color: '#8F959E' }} />
            <span style={{ marginTop: 4, color: '#8F959E', fontSize: 12 }}>上传图片</span>
          </div>
        </Upload>
      )}
    </div>
  )
}
