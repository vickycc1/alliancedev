import { useState } from 'react'
import { Button, Dropdown, message, Modal, Typography } from 'antd'
import {
  ShareAltOutlined,
  WechatOutlined,
  LinkOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ShareChannel } from '@/types/common'
import request from '@/api'

const { Text } = Typography

interface ShareButtonProps {
  postId: number
  title?: string
  size?: 'small' | 'middle' | 'large'
}

export default function ShareButton({ postId, title, size = 'middle' }: ShareButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${postId}`)
    message.success('链接已复制到剪贴板')
    recordShare(ShareChannel.COPY)
  }

  const handleWechat = () => {
    setModalOpen(true)
    recordShare(ShareChannel.WECHAT)
  }

  const handleLink = () => {
    handleCopyLink()
    recordShare(ShareChannel.LINK)
  }

  const recordShare = async (channel: ShareChannel) => {
    try {
      await request.post('/interaction/share', null, { params: { postId, channel } })
    } catch {
      // ignore
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制链接',
      onClick: handleCopyLink,
    },
    {
      key: 'wechat',
      icon: <WechatOutlined style={{ color: '#07C160' }} />,
      label: '微信分享',
      onClick: handleWechat,
    },
    {
      key: 'link',
      icon: <LinkOutlined />,
      label: '链接分享',
      onClick: handleLink,
    },
  ]

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<ShareAltOutlined />} size={size}>
          分享
        </Button>
      </Dropdown>
      <Modal
        title="微信分享"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={320}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <QrcodeOutlined style={{ fontSize: 120, color: '#07C160', marginBottom: 16 }} />
          <div>
            <Text type="secondary">扫描二维码分享给微信好友</Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text strong>{title || '分享帖子'}</Text>
          </div>
        </div>
      </Modal>
    </>
  )
}
