import { Document } from "mongoose";
import { IAddress } from "~/api/v1/types/address.type";
import { ICartItem } from "~/api/v1/types/cart.type";
import { Gender, Role, Status } from "~/api/v1/types/comon.types";


// Social when user login
export interface ISocialAccounts {
  googleId?: string
  facebookId?: string
}

// Main User Document Interface
export interface IUser extends Document {

  // Info Basic
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

  // Security
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  passwordResetToken?: string
  passwordExpires?: Date
  passwordChangeAt?: Date

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

export interface RegisterUser {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  dateOfBirth?: Date
  gender?: Gender
}

export interface LoginUser {
  email: string
  password: string
}

export interface ChangePassword {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPassword {
  email: string
}

// 