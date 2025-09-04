import { IUser } from '~/api/v1/types/user.type'
export type StatusRes = 'success' | 'error'

export interface UserResponseType {
  status: StatusRes
  message: string
  data?: {
    users: Omit<IUser, 'password' | 'passwordResetToken' | 'emailVerificationToken'>
    token?: string
  }
}

export interface UsersListResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    users: IUser[]
    total: number
    page: number
    limit: number
  }
}

export interface ISuccessResponse<T = any> {
  status: 'success'
  statusCode: number
  message: string
  data?: T
  metadata?: {
    timestamp: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    refreshType?: string
  }
}
