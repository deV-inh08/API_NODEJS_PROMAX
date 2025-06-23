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
