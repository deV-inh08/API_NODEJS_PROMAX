import mongoose from 'mongoose'
import { IDiscount } from '~/api/v1/types/discount.type'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { discountSchema } from '~/api/v1/models/discount.model'
import { createDiscountZodType } from '~/api/v1/validations/discount.validation'
import { unescape } from 'querystring'

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
    const { discount_applies_to, discount_code, discount_description, discount_end_date, discount_is_active, discount_max_uses, discount_max_uses_per_user, discount_min_order_value, discount_name, discount_product_ids, discount_start_date, discount_type, discount_value, shop_id } = payload
    const newDiscount = await DiscountModel.create({
      discount_applies_to,
      discount_code,
      discount_description,
      discount_start_date,
      discount_end_date,
      discount_is_active,
      discount_max_uses,
      discount_max_uses_per_user,
      discount_min_order_value,
      discount_name,
      discount_type,
      discount_value,
      shop_id,
      discount_product_ids: discount_applies_to == 'all' ? [] : discount_product_ids,
    })
    return newDiscount
  }
}
