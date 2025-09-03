import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '~/api/v1/utils/response.util'
import { addToCartZodType, updateCartQuantityZodType } from '~/api/v1/validations/cart.validation'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { ProductRepository } from '~/api/v1/repositories/product.repository'
import { convertObjectIdToString, convertStringToObjectId } from '~/api/v1/utils/common.util'
import { InventoryRepository } from '~/api/v1/repositories/inventory.repository'
import { CartRepository } from '~/api/v1/repositories/cart.repository'
import { ICartProducts, ICartVariant } from '~/api/v1/types/cart.type'
import { ShopRepository } from '~/api/v1/repositories/shop.repository'

/**
 * - Add product to cart
 * - reduce product quantity
 * - Increase  product quantity
 * - Gell All product in Cart
 * - Delete cart
 * - Delete cart item
 */

export class CartService {
  private userRepository: UserRepository
  private productRepository: ProductRepository
  private inventoryRepository: InventoryRepository
  private cartRepository: CartRepository
  private shopRepository: ShopRepository
  constructor() {
    this.cartRepository = new CartRepository()
    this.userRepository = new UserRepository()
    this.productRepository = new ProductRepository()
    this.inventoryRepository = new InventoryRepository()
    this.shopRepository = new ShopRepository()
  }

  private isSameVariant(oldCartVariant: ICartVariant, newCartVariant: ICartVariant): boolean {
    if (oldCartVariant.color === newCartVariant.color && oldCartVariant.size == newCartVariant.size) return true
    return false
  }

  addToCart = async (user_id: string, body: addToCartZodType) => {
    try {
      const { productId, shopId, quantity, variant } = body
      // check user is active
      const user = await this.userRepository.getUserById(user_id)
      if (!user) {
        throw new NotFoundError('Cannot found user')
      }
      // check  product is exists by product_id
      const product = await this.productRepository.findProduct({
        productId: productId,
        unSelect: ['__v']
      })
      if (!product) {
        throw new NotFoundError('Cannot found product')
      }
      const { isPublished, shop_id, _id, product_name, product_price } = product
      if (!isPublished) {
        throw new UnauthorizedError('Product not published')
      }
      // check shop_id is same ?
      if (shopId !== convertObjectIdToString(shop_id)) {
        throw new ConflictError('Shop_id is not same')
      }
      // check stock
      const inventory = await this.inventoryRepository.getInventory({ shopId, productId })
      if (!inventory) {
        throw new NotFoundError('Cannot found inventory')
      }
      const stock = inventory.inven_stock
      if (quantity > stock) {
        throw new BadRequestError('Requested quantity exceeds available stock')
      }

      // cartData
      const cartProductData: ICartProducts = {
        product_id: _id,
        shop_id: shop_id,
        product_name,
        product_price,
        product_quantity: quantity,
        product_stock: stock,
        product_variant: variant
      }

      // find cart by userId
      const userCart = await this.cartRepository.findCartByUserId(user_id)

      if (!userCart) {
        const result = await this.cartRepository.createCart({
          user_id: convertStringToObjectId(user_id),
          cart_state: 'active',
          cart_count_products: 1,
          cart_total_item: quantity,
          cart_products: [cartProductData]
        })
        return {
          cart: result,
          message: 'Product added to cart successfully',
          isNewCart: true
        }
      } else {
        const existingProductIndex = userCart.cart_products.findIndex(
          (item) =>
            item.product_id.toString() === productId &&
            item.shop_id.toString() === shopId &&
            this.isSameVariant(item.product_variant, body.variant)
        )
        // Update existing product
        if (existingProductIndex !== -1) {
          const existingProduct = userCart.cart_products[existingProductIndex]
          const newQuantity = Number(existingProduct.product_quantity + quantity)

          if (newQuantity > stock) {
            throw new BadRequestError(
              `Cannot add ${quantity} more. Total would be ${newQuantity} but only ${stock} available`
            )
          }
          userCart.cart_products[existingProductIndex].product_quantity = newQuantity
          userCart.cart_products[existingProductIndex].product_stock = stock
        } else {
          userCart.cart_products.push(cartProductData)
        }

        // Recaculate totals
        userCart.cart_count_products = userCart.cart_products.length
        userCart.cart_total_item = userCart.cart_products.reduce((total, item) => {
          return total + item.product_quantity
        }, 0)

        const result = await this.cartRepository.updateCartById(userCart._id.toString(), {
          cart_products: userCart.cart_products,
          cart_count_products: userCart.cart_count_products,
          cart_total_item: userCart.cart_total_item
        })

        return result
      }
    } catch (error) {
      throw new BadRequestError('Add To Cart Failed')
    }
  }

  deleteAllProductFromCart = async (
    userId: string,
    cartId: string,
    body: {
      productId: string
      shopId: string
      variant?: ICartVariant
    }
  ) => {
    try {
      const { productId, shopId, variant } = body

      // Remove product from cart
      const result = await this.cartRepository.removeProductFromCart(userId, cartId, productId, shopId, variant)

      if (result.modifiedCount === 0) {
        throw new NotFoundError('Product not found in cart')
      }
      // Recalculate totals
      await this.cartRepository.recalculateCartTotals(userId)

      // Get updated cart
      const updatedCart = await this.cartRepository.findCartByUserId(userId)
      return updatedCart
    } catch (error) {
      throw new BadRequestError('Add To Cart Failed')
    }
  }

  getListUserCart = async (userId: string) => {
    try {
      const result = await this.cartRepository.getListUserCart(userId)
      return result
    } catch (error) {
      throw new BadRequestError('Get List User Cart Failed')
    }
  }

  updateCartQuantity = async (userId: string, cartId: string, body: updateCartQuantityZodType) => {
    try {
      const { productId, quantity, shopId, variant } = body
      // validate user
      const user = await this.userRepository.getUserById(userId)
      if (!user) {
        throw new NotFoundError('User not found')
      }

      // validate product
      const product = await this.productRepository.findProduct({
        productId: productId,
        unSelect: ['__v']
      })
      if (!product || !product.isPublished) {
        throw new NotFoundError('Product not found')
      }

      // validate shop
      const shop = await this.shopRepository.findShopById(shopId)
      if (!shop) {
        throw new NotFoundError('Shop not found')
      }

      // check stock
      const inventory = await this.inventoryRepository.getInventory({
        shopId: convertObjectIdToString(shop._id),
        productId
      })

      if (!inventory) {
        throw new NotFoundError('Invetory  not found')
      }
      const stock = inventory.inven_stock
      if (quantity > stock) {
        throw new BadRequestError(`Insufficient stock. Available: ${inventory.inven_stock}, Requested: ${quantity}`)
      }

      // update Cart Item Quantity
      const result = await this.cartRepository.updateCartItemQuantity(
        userId,
        cartId,
        shopId,
        productId,
        quantity,
        variant
      )
      return result
    } catch (error) {
      throw new BadRequestError('Update cart quantity failed')
    }
  }
}
