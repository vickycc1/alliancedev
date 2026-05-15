import type { UserStatus, RoleCode } from './common'

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  bio?: string
  casId?: string
  status: UserStatus
  roles: RoleCode[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: User
}
