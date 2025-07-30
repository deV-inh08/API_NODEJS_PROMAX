import mongoose, { Types } from 'mongoose'
import { IDiscount } from '~/api/v1/types/discount.type'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { discountSchema } from '~/api/v1/models/discount.model'
import { createDiscountZodType, updateDiscountZodType } from '~/api/v1/validations/discount.validation'
import { convertStringToObjectId, unGetSelectData } from '~/api/v1/utils/common.util'

export class DiscountRepository extends BaseRepository {
  private models = new Map<string, mongoose.Model<IDiscount>>()

  async getDiscountModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const discountModel = connection.model('Discounts', discountSchema)
      this.models.set(dbName, discountModel)
    }
    return this.models.get(dbName)!
  }

  // find discount
  async findDiscountByCode(discountCode: string, shop_id: Types.ObjectId) {
    const DiscountModel = await this.getDiscountModel()
    const foundDisount = await DiscountModel.findOne({
      shop_id: shop_id,
      discount_code: discountCode
    }).lean()
    return foundDisount
  }

  // create discount
  async createDiscount(payload: createDiscountZodType, shop_id: string) {
    const DiscountModel = await this.getDiscountModel()
    const { discount_applies_to, discount_product_ids } = payload
    const newDiscount = await DiscountModel.create({
      ...payload,
      shop_id: convertStringToObjectId(shop_id),
      discount_product_ids: discount_applies_to == 'all' ? [] : discount_product_ids,
      discount_uses_count: 0,
      discount_users_used: []
    })
    return newDiscount
  }

  async findDiscountById(discountId: string, shopId: string, unSelectData: string[]) {
    const DiscountModel = await this.getDiscountModel()
    const getDiscount = await DiscountModel.findOne({
      _id: discountId,
      shop_id: shopId
    })
      .select(unGetSelectData(unSelectData))
      .lean()
    return getDiscount
  }

  async findDiscountsByShopId(
    filter: {
      shop_id: string
      discount_is_active: boolean
    },
    unSelect: string[],
    limit: number,
    page: number,
    sort = 'ctime'
  ) {
    const DiscountModel = await this.getDiscountModel()
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const discounts = await DiscountModel.find(filter)
      .skip(+skip)
      .limit(+limit)
      .select(unGetSelectData(unSelect))
      .sort(sortBy as { _id: 1 | -1 })
      .lean()
    return discounts
  }

  async updateDiscount(
    payload: updateDiscountZodType & {
      _id: string
    }
  ) {
    const DiscountModel = await this.getDiscountModel()
    const { _id } = payload

    const updateDiscount = await DiscountModel.findByIdAndUpdate(
      _id,
      {
        ...payload,
        updatedAt: new Date()
      },
      {
        new: true,
        lean: true
      }
    )
    return updateDiscount
  }
}
