import mongoose from 'mongoose'
import dbManager from '~/api/v1/db/dbName.mongo'
import { IDeviceInfo, IRefreshToken } from '~/api/v1/types/auth.type'
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
  async saveRefreshtoken(tokenData: { userId: string; token: string; iat: Date; exp: Date; deviceInfo?: IDeviceInfo }) {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    return await refreshTokenModel.create(tokenData)
  }

  //  Database token validation
  async findActiveToken(userId: string, token: string) {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    return await refreshTokenModel.findOne({
      userId,
      token,
      isActive: true,
      exp: {
        $gt: new Date()
      }
    }).lean()
  }

  //  Update lại token nếu user bị unactive
  async deactiveTokenById(tokenId: string) {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    return await refreshTokenModel.updateOne(
      { _id: tokenId },
      {
        isActive: false,
        updateAt: new Date()
      }
    )
  }


  /**
   * Xóa tokens đã hết hạn và inActive quá lâu (inActive 2 months)
   * Chạy mỗi tuần để cleanUp (cron job)
   * @returns 
   */
  async cleanupExpiredTokens() {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    const result = await refreshTokenModel.deleteMany({
      $or: [
        {
          exp: {
            $lt: new Date() // lessThan now -> Expired tokens
          }
        },
        {
          isActive: false,
          updateAt: { twoMonthsAgo } // Inactive for 2 months
        }
      ]
    })
    console.log(`🧹 Cleaned up ${result.deletedCount} expired refresh tokens`)
    return result
  }


  /**
    * Limit Token Active
    * 1 User có thể có nhiều token: Đăng nhập khác thiết bị | khác Browser...
    *  Tối đa là 3 token cho mỗi user: laptop | phone | backup
    * Nếu quá max token -> set inActive token cũ nhất
    */
  async limitUserTokens(userId: string, maxTokens: number = 3) {
    const refreshTokenModel = await this.getRefreshTokenModel(this.dbName)
    // Lấy số token active dựa trên 'userID'
    const activeTokensCount = await refreshTokenModel.countDocuments({
      userId,
      isActive: true,
      exp: { $gt: new Date() }
    })
    if (activeTokensCount > maxTokens) {
      // Get list old tokens
      const oldTokens = await refreshTokenModel
        .find({
          userId,
          isActive: true,
          exp: {
            $gt: new Date()
          }
        })
        .sort({
          createdAt: 1
        })
        .limit(activeTokensCount - maxTokens)
      // revoke old tokens
      const oldTokenIds = oldTokens.map((token) => token._id)
      await refreshTokenModel.updateMany(
        {
          _id: {
            $in: oldTokenIds
          }
        },
        { isActive: false }
      )
    }
  }
}

export class TokenCleanUpScheduler {
  private refreshTokenRepo: RefreshTokenRepository
  private cleanUpInterval: NodeJS.Timeout | null = null
  constructor() {
    this.refreshTokenRepo = new RefreshTokenRepository()
  }

  /**
   * Bắt đầu weekly cleanup (cron job)
   */
  async startWeeklyCleanup() {
    if (this.cleanUpInterval) {
      console.log('Cleanup scheduler already running')
      return
    }

    // chạy ngay lập tức (lần đầu)
    this.runCleanUp()

    const _DAYS = 7 * 24 * 60 * 60 * 1000 // 7days
    // Sau đó 7 ngày chạy 1 lần
    this.cleanUpInterval = setInterval(() => {
      this.runCleanUp()
    }, _DAYS)
  }

  /**
   * Stop cleanUp
   */
  stopWeekCleanUp() {
    if (this.cleanUpInterval) {
      clearInterval(this.cleanUpInterval)
      this.cleanUpInterval = null
      console.log('Stop cleanup successfully');
    }
  }

  /**
   * Run cleanUp
   */
  private async runCleanUp() {
    try {
      const result = await this.refreshTokenRepo.cleanupExpiredTokens()
      console.log('Weekly cleanup completed', {
        deleteTokens: result.deletedCount
      });
    } catch (error) {
      console.log('Error run clean up', error);
    }
  }
}
