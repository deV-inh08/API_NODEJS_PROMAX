import mongoose from 'mongoose'
import dbManager from '~/api/v1/db/dbName.mongo'
import { IRefreshToken } from '~/api/v1/types/auth.type'
import { refreshTokenSchema } from '~/api/v1/models/refreshtoken.model'

export class RefreshTokenRepository {
  private models = new Map<string, mongoose.Model<IRefreshToken>>()
  private dbName: 'ecommerce' = 'ecommerce' as const

  private async getRefreshTokenModel(dbName: 'ecommerce' | 'testing') {
    if (!this.models.has(dbName)) {
      const connection = await dbManager.getConnection(dbName)
      const refreshTokenModel = connection.model('RefreshToken', refreshTokenSchema)
      this.models.set(dbName, refreshTokenModel)
    }
    return this.models.get(dbName)!
  }

  // save freshToken in DB
  async saveRefreshtoken(tokenData: { userId: string; token: string; expiresAt: Date; deviceInfo?: any }) {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    return await refreshTokenModel.create(tokenData)
  }
}
