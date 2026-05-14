import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'

const themeConfig = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F2F3F5',
    colorText: '#1F2329',
    colorTextSecondary: '#646A73',
    colorTextTertiary: '#8F959E',
    colorBorder: '#DEE0E3',
    colorBgTextHover: '#F7F8FA',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Card: {
      borderRadiusLG: 8,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Message: {
      borderRadius: 6,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
