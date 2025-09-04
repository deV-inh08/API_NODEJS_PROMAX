import { Schema } from 'mongoose'
import { IBlackListsType } from '~/api/v1/types/tokensBlackList.type'

export const tokenBlackListsSchema = new Schema<IBlackListsType>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  blacklistedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: {
      expireAfterSeconds: 0
    }
  }
})
