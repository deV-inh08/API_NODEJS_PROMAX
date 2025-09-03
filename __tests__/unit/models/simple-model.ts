import mongoose, { Schema, Model } from 'mongoose'
import { IUser } from '~/api/v1/types/user.type'
import { IRefreshToken } from '~/api/v1/types/auth.type'

// Simple User Model for Unit Tests
const SimpleUserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    gender: { type: String, default: 'other' },
    role: { type: String, default: 'customer' },
    status: { type: String, default: 'active' },
    isEmailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Simple RefreshToken Model for Unit Tests
const SimpleRefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    exp: { type: Date, required: true },
    iat: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    deviceInfo: {
      userAgent: String,
      ip: String
    }
  },
  { timestamps: true }
)

// Export models - will be created in memory
export const getUserModel = (): Model<IUser> => {
  // Delete model if exists (for test isolation)
  if (mongoose.models.User) {
    delete mongoose.models.User
  }
  return mongoose.model<IUser>('User', SimpleUserSchema)
}

export const getRefreshTokenModel = (): Model<IRefreshToken> => {
  if (mongoose.models.RefreshToken) {
    delete mongoose.models.RefreshToken
  }
  return mongoose.model<IRefreshToken>('RefreshToken', SimpleRefreshTokenSchema)
}
