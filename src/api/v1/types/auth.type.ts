import mongoose, { Document } from 'mongoose'

// Device info tracking login session
export interface IDeviceInfo {
  userAgent?: string
  ip?: string
  deviceName?: string
  location?: string
}

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  deviceInfo: IDeviceInfo
  isActive: boolean

  // timestamp from mongoose
  createAt: Date
  updateAt: Date
}
