import { DiscountRepository } from '~/api/v1/repositories/discount.repository'
import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { createDiscountZodType, updateDiscountZodType } from '~/api/v1/validations/discount.validation'
export class DiscountServices {
  private discountRepository: DiscountRepository
  private shopRepository: ShopRepository
  constructor() {
    this.discountRepository = new DiscountRepository()
    this.shopRepository = new ShopRepository()
  }

  // create discount
  createDiscount = async (payload: createDiscountZodType, userId: string) => {
    try {
      const { discount_end_date, discount_start_date, discount_code } = payload
      const now = new Date()
      if (now > new Date(discount_end_date) || now < new Date(discount_start_date)) {
        throw new BadRequestError('Discount code has expired!')
      }
      if (new Date(discount_start_date) > new Date(discount_end_date)) {
        throw new BadRequestError('start_date must be before end_date')
      }
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new NotFoundError('Shop not found')
      }
      const shop_id = convertObjectIdToString(shop._id)
      const foundDiscount = await this.discountRepository.findDiscountByCode(discount_code, shop_id)
      if (foundDiscount) {
        throw new BadRequestError('Discount exists!')
      }
      const newDiscount = await this.discountRepository.createDiscount(payload, shop_id)
      return newDiscount
    } catch (error) {
      throw new BadRequestError('create discount failed')
    }
  }

  // update discount
  updateDiscount = async (payload: updateDiscountZodType, userId: string, discountId: string) => {
    try {
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new NotFoundError('Cannot find shop')
      }
      const shopId = convertObjectIdToString(shop._id)
      const currentDiscount = await this.discountRepository.findDiscountById(discountId, shopId, [
        '__v',
        'discount_uses_count'
      ])
      if (!currentDiscount) {
        throw new NotFoundError('Cannot find discount!')
      }

      const updateDiscount = await this.discountRepository.updateDiscount({
        ...payload,
        _id: convertObjectIdToString(currentDiscount._id)
      })

      if (!updateDiscount) {
        throw new NotFoundError('Discount not found')
      }
      return updateDiscount
    } catch (error) {
      throw new BadRequestError('update discount failed')
    }
  }

  getListDiscountByShop = async (userId: string) => {
    try {
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new NotFoundError('Cannot found shop!')
      }
      const shop_id = convertObjectIdToString(shop._id)
      const discounts = await this.discountRepository.findDiscountsByShopId(
        {
          discount_is_active: true,
          shop_id
        },
        ['__v', 'shop_id'],
        50,
        1
      )
      if (!discounts) {
        throw new NotFoundError('Cannot not found discounts')
      }
      return discounts
    } catch (error) {
      throw new BadRequestError('get list discount failed')
    }
  }
}
