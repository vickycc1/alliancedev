import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import type { Result } from '@/types/common'
import { setupMockInterceptor } from '@/mock/handlers'

const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'
const TOKEN_EXPIRES_KEY = 'admin_token_expires'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

setupMockInterceptor(request)

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

function addPendingRequest(cb: (token: string) => void) {
  pendingRequests.push(cb)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(token: string, refreshToken: string, expiresIn: number): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt))
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRES_KEY)
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)
  if (!expiresAt) return true
  return Date.now() >= Number(expiresAt)
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    const res = response.data as Result
    if (res.code !== 0 && res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  async (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      const refreshToken = getRefreshToken()
      if (!refreshToken || isRefreshing) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await axios.post<Result<{ token: string; refreshToken: string; expiresIn: number }>>(
            '/api/auth/refresh',
            { refreshToken },
          )
          if (data.data) {
            setTokens(data.data.token, data.data.refreshToken, data.data.expiresIn)
            onTokenRefreshed(data.data.token)
          }
        } catch {
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve) => {
        addPendingRequest((token: string) => {
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`
            resolve(request(error.config))
          }
        })
      })
    }

    if (status === 403) {
      message.error('无权限访问')
    } else if (status === 404) {
      message.error('请求资源不存在')
    } else if (status && status >= 500) {
      message.error('服务器错误')
    } else {
      message.error('网络异常，请稍后重试')
    }

    return Promise.reject(error)
  },
)

export default request
