import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import type { Result } from '@/types/common'

export type { Result } from '@/types/common'
export type { PageResult, PageParams } from '@/types/common'

const TOKEN_KEY = 'techcommunity_token'
const REFRESH_TOKEN_KEY = 'techcommunity_refresh_token'
const TOKEN_EXPIRES_KEY = 'techcommunity_token_expires'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
    if (res.code !== undefined && res.code !== 200) {
      const errorMsg = res.message || '请求失败'
      if (res.code === 401) {
        handleUnauthorized()
        return Promise.reject(new Error(errorMsg))
      }
      message.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        handleUnauthorized()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addPendingRequest((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(request(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post<Result<{ token: string; refreshToken: string; expiresIn: number }>>('/api/auth/refresh', {
          refreshToken,
        })

        if (data.code === 200 && data.data) {
          const { token: newToken, refreshToken: newRefreshToken, expiresIn } = data.data
          setTokens(newToken, newRefreshToken, expiresIn)
          onTokenRefreshed(newToken)
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return request(originalRequest)
        } else {
          handleUnauthorized()
          return Promise.reject(error)
        }
      } catch {
        handleUnauthorized()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    const status = error.response?.status
    const errorMessages: Record<number, string> = {
      400: '请求参数错误',
      403: '没有访问权限',
      404: '请求资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
    }

    const errorMsg = errorMessages[status || 0] || `请求失败 (${status || '网络错误'})`
    message.error(errorMsg)
    return Promise.reject(error)
  },
)

function handleUnauthorized() {
  clearTokens()
  const currentPath = window.location.pathname
  if (currentPath !== '/login') {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
  }
}

export default request
