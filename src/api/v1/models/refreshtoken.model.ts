import { Schema } from 'mongoose'
import { IRefreshToken } from '~/api/v1/types/auth.type'

export const refreshTokenModelSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    exp: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0
      }
    },
    iat: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deviceInfo: {
      userAgent: String,
      ip: String
    }
  },
  {
    timestamps: true
  }
)
