import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
import { BadRequestError, ConflictError, NotFoundError } from '~/api/v1/utils/response.util'
import { shopRegistrationZodType } from '~/api/v1/validations/shop.validation'

export class ShopServices {
  private userRepository: UserRepository
  private shopRepository: ShopRepository

  constructor() {
    this.shopRepository = new ShopRepository()
    this.userRepository = new UserRepository()
  }

  // register seller
  registerShop = async (userId: string, shopBody: shopRegistrationZodType) => {
    try {
      // check if user exits
      const user = await this.userRepository.getUserById(userId)
      console.log('user', user)
      if (!user) {
        throw new NotFoundError('User not found')
      }

      // check role
      if (user.role == 'seller' || user.role == 'admin') {
        throw new ConflictError('User is ready a seller')
      }

      // Check shopName is exists
      const isShopNameExists = await this.shopRepository.findShopByName(shopBody.shop_name)
      if (isShopNameExists) {
        throw new ConflictError('Shop name already exists')
      }

      // Create shop
      const shopData = {
        user_id: convertStringToObjectId(userId),
        shop_name: shopBody.shop_name,
        shop_slug: shopBody.shop_name,
        shop_description: shopBody.shop_description,
        shop_logo: shopBody.shop_logo,
        business_type: shopBody.business_type,
        tax_id: shopBody.tax_id,
        phone: shopBody.phone,
        address: shopBody.address,
        shop_ratings: 0,
        total_products: 0,
        total_sales: 0,
        is_verified: false,
        status: 'active' as const
      }

      const newShop = await this.shopRepository.createShop(shopData)

      return {
        shop: {
          id: newShop._id,
          shop_name: newShop.shop_name,
          shop_slug: newShop.shop_slug,
          shop_description: newShop.shop_description,
          is_verified: newShop.is_verified,
          status: newShop.status
        },
        user: {
          id: userId,
          role: 'seller'
        }
      }
    } catch (error) {
      throw new BadRequestError('Register shop failed')
    }
  }
}
