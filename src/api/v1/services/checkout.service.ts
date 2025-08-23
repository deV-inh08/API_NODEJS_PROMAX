import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { checkoutSchemaZodType } from '~/api/v1/validations/checkout.validation'
import { CartRepository } from '~/api/v1/repositories/cart.repository'
import { ProductRepository } from '~/api/v1/repositories/product.repository'
import { FlattenMaps } from 'mongoose'
import { IProduct } from '~/api/v1/types/product.type'
import { DiscountRepository } from '~/api/v1/repositories/discount.repository'
import { DiscountServices } from '~/api/v1/services/discount.service'
import { IDiscount } from '~/api/v1/types/discount.type'

export class CheckoutService {
  private cartRepository: CartRepository
  private productRepository: ProductRepository
  private discountRepository: DiscountRepository
  private discountServices: DiscountServices

  constructor() {
    this.cartRepository = new CartRepository()
    this.productRepository = new ProductRepository()
    this.discountRepository = new DiscountRepository()
    this.discountServices = new DiscountServices()
  }

  checkoutReview = async (userId: string, body: checkoutSchemaZodType) => {
    try {
      const { cartId, shop_order_ids } = body

      // Check cart exists
      const cart = await this.cartRepository.findCartById(cartId)
      if (!cart) {
        throw new NotFoundError('Cart does not exists!')
      }

      const checkout_order = {
        totalPrice: 0,
        feeShip: 0,
        totalDiscount: 0,
        totalCheckout: 0
      }
      const shop_order_ids_new = []

      // Batch fetch all products
      const allProductIds = shop_order_ids.flatMap((shop) => shop.item_products.map((item) => item.productId) || [])

      const allProducts = await this.productRepository.checkProductByIds(allProductIds)
      const productMap = new Map(allProducts.map((p) => [p._id?.toString(), p]))

      // Type guard
      const isValidProduct = (product: FlattenMaps<IProduct> | undefined): product is FlattenMaps<IProduct> => {
        return product !== undefined && product !== null
      }

      // ✅ FIXED: Process each shop correctly
      for (let i = 0; i < shop_order_ids.length; i++) {
        const { shop_id, shop_discounts = [], item_products = [] } = shop_order_ids[i]

        // Validate products
        const checkProductServer = item_products.map((item) => productMap.get(item.productId)).filter(isValidProduct)

        if (!checkProductServer || checkProductServer.length === 0) {
          throw new BadRequestError(`Shop ${shop_id}: Không có sản phẩm hợp lệ trong đơn hàng`)
        }

        if (checkProductServer.length !== item_products.length) {
          const foundProductIds = checkProductServer.map((p) => p._id?.toString())
          const missingProducts = item_products
            .filter((item) => !foundProductIds.includes(item.productId))
            .map((item) => item.productId)
          throw new BadRequestError(`Shop ${shop_id}: Sản phẩm không tồn tại: ${missingProducts.join(', ')}`)
        }

        // Calculate shop subtotal
        const checkoutPrice = checkProductServer.reduce((acc, product) => {
          if (!product || typeof product.product_price !== 'number') {
            throw new BadRequestError(`Product thiếu thông tin giá`)
          }

          const requestedItem = item_products.find((item) => item.productId === product._id?.toString())
          if (!requestedItem) {
            throw new BadRequestError(`Không tìm thấy thông tin quantity`)
          }

          // ✅ ADDED: Additional validations
          if (product.product_quantity < requestedItem.quantity) {
            throw new BadRequestError(`Product ${product.product_name} chỉ còn ${product.product_quantity} sản phẩm`)
          }

          return acc + requestedItem.quantity * product.product_price
        }, 0)

        // Update total price
        checkout_order.totalPrice += checkoutPrice

        let shopDiscount = 0
        let discountDetails: {
          discount_code: string
          discount_amount: number
          discount_type?: string
          original_order: number
          final_price: number
        }[] = []

        if (shop_discounts && shop_discounts.length > 0) {
          try {
            // Validate discounts first
            const validDiscounts: Array<{
              discountId: string
              discountcode: string
              isValid: boolean
              discount?: IDiscount
              reason?: string
            }> = []

            for (const discountInfo of shop_discounts) {
              if (!discountInfo.discountcode || !discountInfo.discountId) {
                throw new BadRequestError(`Shop ${shop_id}: Thông tin discount không đầy đủ`)
              }

              const discountValidation = await this.discountServices.validateDiscount({
                discountCode: discountInfo.discountcode,
                discountId: discountInfo.discountId,
                userId,
                shopId: shop_id,
                orderAmount: checkoutPrice
              })

              console.log('discountValidation', discountValidation)

              if (discountValidation.isValid) {
                validDiscounts.push({
                  ...discountInfo,
                  ...discountValidation
                })
              } else {
                console.warn(`Discount ${discountInfo.discountcode} không hợp lệ:`, discountValidation.reason)
              }
            }

            // Apply discounts (use first valid discount)
            if (validDiscounts.length > 0) {
              const firstValidDiscount = validDiscounts[0]
              console.log('firstValidDiscount', firstValidDiscount)

              const discountResult = await this.discountServices.applyDiscountAmount(userId, {
                discount_code: firstValidDiscount.discountcode,
                products: checkProductServer.map((product) => {
                  const requestedItem = item_products.find((item) => item.productId === product._id?.toString())
                  return {
                    _id: product._id?.toString() || '',
                    product_quantity: requestedItem?.quantity || 0,
                    product_price: product.product_price
                  }
                })
              })

              if (discountResult && discountResult.discount) {
                shopDiscount = Math.min(discountResult.discount, checkoutPrice)
                discountDetails = [
                  {
                    discount_code: firstValidDiscount.discountcode,
                    discount_amount: shopDiscount,
                    discount_type: firstValidDiscount.discount?.discount_type,
                    original_order: discountResult.totalOrder,
                    final_price: discountResult.totalPrice
                  }
                ]

                // Update total discount
                checkout_order.totalDiscount += shopDiscount
              }
            }
          } catch (discountError) {
            // Continue without discount rather than failing entire checkout
            shopDiscount = 0
            discountDetails = []
          }
        }

        // ✅ FIXED: Build shop result (outside discount loop)
        const itemCheckout = {
          shop_id,
          shop_discounts: shop_discounts || [],
          priceRaw: checkoutPrice,
          priceApplyDiscount: Math.max(0, checkoutPrice - shopDiscount),
          discountAmount: shopDiscount,
          discountDetails: discountDetails,
          item_products: checkProductServer.map((product) => {
            const requestedItem = item_products.find((item) => item.productId === product._id?.toString())
            return {
              productId: product._id,
              product_name: product.product_name,
              product_price: product.product_price,
              product_quantity: product.product_quantity,
              quantity: requestedItem?.quantity || 0,
              subtotal: (requestedItem?.quantity || 0) * product.product_price,
              remaining_stock: product.product_quantity - (requestedItem?.quantity || 0)
            }
          }),
          metadata: {
            hasDiscount: shopDiscount > 0,
            discountPercentage: checkoutPrice > 0 ? ((shopDiscount / checkoutPrice) * 100).toFixed(2) : '0',
            originalPrice: checkoutPrice,
            finalPrice: checkoutPrice - shopDiscount
          }
        }

        // ✅ FIXED: Push once per shop
        shop_order_ids_new.push(itemCheckout)
      }

      // ✅ FIXED: Calculate final totals outside loop
      checkout_order.totalCheckout = checkout_order.totalPrice - checkout_order.totalDiscount + checkout_order.feeShip

      // ✅ FIXED: Return at the end
      return {
        shop_order_ids: shop_order_ids_new,
        checkout_order,
        metadata: {
          totalShops: shop_order_ids_new.length,
          totalItems: shop_order_ids_new.reduce((acc, shop) => acc + shop.item_products.length, 0),
          processedAt: new Date().toISOString(),
          userId,
          cartId
        }
      }
    } catch (error) {
      // Enhanced error handling
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error
      }
      throw new BadRequestError(`Checkout review failed`)
    }
  }
}
