import { create } from 'zustand'
import request, { setTokens, clearTokens } from '@/api'
import type { Result } from '@/types/common'
import type { User, LoginRequest, LoginResponse } from '@/types/user'

export type { User as UserInfo } from '@/types/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean

  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (username: string, password: string) => {
    const { data } = await request.post<Result<LoginResponse>>('/auth/login', {
      username,
      password,
    } as LoginRequest)

    if (data.data) {
      const { token, refreshToken, expiresIn, user } = data.data
      setTokens(token, refreshToken, expiresIn)
      set({ user, isAuthenticated: true })
    }
  },

  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  fetchProfile: async () => {
    set({ loading: true })
    try {
      const { data } = await request.get<Result<User>>('/user/profile')
      if (data.data) {
        set({ user: data.data, isAuthenticated: true })
      }
    } catch {
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ loading: false })
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
  },
}))
