import { BaseRepository } from "~/api/v1/repositories/base.repository";
import mongoose, { Types } from "mongoose";
import { ICartItem, ICartProducts } from "~/api/v1/types/cart.type";
import { cartSchema } from "~/api/v1/models/cart.model";
import { addToCartZodType } from "~/api/v1/validations/cart.validation";
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
}