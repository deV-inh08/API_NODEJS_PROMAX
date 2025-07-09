import mongoose, { Document } from 'mongoose'
import { IAddress } from '~/api/v1/types/address.type'
import { ICartItem } from '~/api/v1/types/cart.type'
import { Gender, Role, Status } from '~/api/v1/types/comon.types'

// Social when user login
export interface ISocialAccounts {
  googleId?: string
  facebookId?: string
}

// Main User Document Interface
export interface IUser extends Document {
  // Info Basic
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: Date
  avatar?: string
  gender: Gender

  // Account Status
  isEmailVerified: boolean
  isPhoneVerified: boolean
  status: Status
  role: Role

  // Address
  address: IAddress[]

  // Cart
  cart: ICartItem[]

  // Wish list
  wishList: mongoose.Types.ObjectId[] // trỏ đến ID Product

  // Security
  emailVerificationToken?: string
  emailVerificationExpires?: Date

  passwordResetOTP: string // Lưu OTP đã hash
  passwordResetOTPExpires: Date // Thời gian hết hạn của OTP
  passwordResetToken?: string // Backup: Email reset thay vì OTP
  passwordResetAttempts: number // Số lần nhập sai OTP
  passwordResetLastAttempts: Date // Thời gian mới nhất nhập OTP
  passwordChangeAt?: Date // Password thay đổi ngày nào
  isOTPVerified?: boolean

  accountLockUntils?: Date // Tạm khóa tài khoản trong khoảng thời gian
  loginAttempts: number // Đếm số lần login sai

  // Statistics
  totalOrders: number
  totalSpent: number

  // Social Account
  socialAccounts?: ISocialAccounts

  // methods
  getFullName(): string
  isActive(): boolean
  clearCart(): void
  removeProductFromCart(productId: string): void
}
export interface IChangePassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface IForgotPassword {
  email: string
}

export interface IResetPassword {
  token: string
  password: string
  confirmPassword: string
}
