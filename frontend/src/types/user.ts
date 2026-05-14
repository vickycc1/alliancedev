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

export interface UserPublic {
  id: number
  username: string
  nickname: string
  avatar: string
  bio?: string
  status: UserStatus
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  nickname: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface UpdateProfileRequest {
  nickname?: string
  email?: string
  phone?: string
  bio?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
