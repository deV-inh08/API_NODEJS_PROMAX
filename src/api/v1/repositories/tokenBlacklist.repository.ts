import mongoose from "mongoose";
import { tokenBlackListsSchema } from "~/api/v1/models/tokensBlackList.model";
import { BaseRepository } from "~/api/v1/repositories/base.repository";
import { IBlackListsType } from "~/api/v1/types/tokensBlackList.type";
import crypto from 'crypto'

export class TokenBlacklistRepository extends BaseRepository {

  private models = new Map<string, mongoose.Model<IBlackListsType>>()
  // get BlackList Model
  async getBlackListModel() {
    const dbName = this.dbName // ecommerce || testing
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const blackListModel = connection.model('BlackList', tokenBlackListsSchema) // create collection BlackList
      this.models.set(dbName, blackListModel) // set models <ecommerce, collection Blacklist>
    }
    // nếu có Collection BList ở models rồi -> Đã kết nối rồi -> return Collection BlackList
    return this.models.get(dbName)!
  }

  // add AT to BList
  async addBlackList(data: {
    userId: string,
    token: string,
    expiresAt: Date
  }) {
    const BlackListModel = await this.getBlackListModel()

    // hash token
    const hashToken = crypto.createHash('sha256').update(data.token).digest('hex')

    return await BlackListModel.create({
      token: hashToken,
      userId: data.userId,
      expiresAt: data.expiresAt,
      blacklistedAt: new Date()
    })
  }

  // check AT have in BList
  async isBlackListModel(token: string) {
    const BlackListModel = await this.getBlackListModel()
    // hash token
    const hashToken = crypto.createHash('sha256').update(token).digest('hex')

    const blacklistedToken = await BlackListModel.findOne({
      token: hashToken,
      expiresAt: { $gt: new Date() }  // Chỉ check tokens chưa expire
    })

    return blacklistedToken
  }
}