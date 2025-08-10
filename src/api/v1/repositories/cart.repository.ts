import { BaseRepository } from '~/api/v1/repositories/base.repository'
import mongoose, { Types } from 'mongoose'
import { ICartItem, ICartVariant } from '~/api/v1/types/cart.type'
import { cartSchema } from '~/api/v1/models/cart.model'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
export class CartRepository extends BaseRepository {
  private model = new Map<string, mongoose.Model<ICartItem>>()

  async getCartModel() {
    const dbName = this.dbName
    if (!this.model.has(dbName)) {
      const connection = await this.getConnection()
      const cartModel = connection.model('Cart', cartSchema)
      this.model.set(dbName, cartModel)
    }
    return this.model.get(dbName)!
  }

  // create cart
  async createCart(cartData: Partial<ICartItem>) {
    const CartModel = await this.getCartModel()
    const result = await CartModel.create(cartData)
    return result
  }

  // find cart by user_id
  async findCartByUserId(user_id: string) {
    const CartModel = await this.getCartModel()
    return CartModel.findOne({
      user_id: user_id
    }).lean()
  }

  // update cart with cartId
  async updateCartById(cartId: string, updateCart: Partial<ICartItem>) {
    const CartModel = await this.getCartModel()
    return await CartModel.findByIdAndUpdate(cartId, updateCart, {
      new: true
    })
  }

  async removeProductFromCart(
    user_id: string,
    cartId: string,
    product_id: string,
    shop_id: string,
    variant?: ICartVariant
  ) {
    const CartModel = await this.getCartModel()
    const query = {
      _id: cartId,
      user_id: convertStringToObjectId(user_id),
      cart_state: 'active'
    }

    const pullCondition: {
      product_id: Types.ObjectId
      shop_id?: Types.ObjectId
      product_variant?: ICartVariant
    } = {
      product_id: convertStringToObjectId(product_id)
    }
    if (shop_id) {
      pullCondition.shop_id = convertStringToObjectId(shop_id)
    }
    if (variant) {
      pullCondition.product_variant = variant
    }

    const updateSet = {
      $pull: {
        cart_products: pullCondition
      }
    }

    const result = await CartModel.updateOne(query, updateSet)
    return result
  }

  async recalculateCartTotals(userId: string) {
    const CartModel = await this.getCartModel()
    const cart = await CartModel.findOne({
      user_id: convertStringToObjectId(userId),
      cart_state: 'active'
    })

    if (cart) {
      const cart_count_products = cart.cart_products.length
      const cart_total_item = cart.cart_products.reduce((total, item) => total + item.product_quantity, 0)

      await CartModel.updateOne(
        { _id: cart._id },
        {
          cart_count_products,
          cart_total_item
        }
      )
    }
  }
}
