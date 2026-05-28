export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  bio?: string
  casId?: string
  status: number
  roles: string[]
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
  status: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  nickname?: string
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
