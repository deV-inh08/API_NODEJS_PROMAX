import mongoose from 'mongoose'
import { IDiscount } from '~/api/v1/types/discount.type'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { discountSchema } from '~/api/v1/models/discount.model'
import { createDiscountZodType } from '~/api/v1/validations/discount.validation'

export class DiscountRepository extends BaseRepository {
  private models = new Map<string, mongoose.Model<IDiscount>>()

  async getDiscountModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const discountModel = connection.model('Discount', discountSchema)
      this.models.set(dbName, discountModel)
    }
    return this.models.get(dbName)!
  }

  // find discount
  async findDiscount(discount_code: string, shop_id: string) {
    const DiscountModel = await this.getDiscountModel()
    const foundDisount = await DiscountModel.findOne({
      discount_code,
      shop_id
    }).lean()
    return foundDisount
  }

  // create discount
  async createDiscount(
    payload: createDiscountZodType & {
      shop_id: string
    }
  ) {
    const DiscountModel = await this.getDiscountModel()
    const newDiscount = await DiscountModel.create({
      ...payload,
      discount_product_ids: payload.discount_applies_to === 'all' ? [] : payload.discount_product_ids
    })
    return newDiscount
  }
}
