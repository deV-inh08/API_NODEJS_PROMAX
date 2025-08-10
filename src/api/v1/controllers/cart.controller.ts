import type { Response, Request, NextFunction } from 'express'
import { CartService } from '~/api/v1/services/cart.service'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import { addToCartZodType, removeProductFromCartZodType } from '~/api/v1/validations/cart.validation'

export class CartController {
  private cartService: CartService

  constructor() {
    this.cartService = new CartService()
  }
  addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      const body: addToCartZodType = req.body
      if (!decodedAT) {
        throw new UnauthorizedError('Access token is expired')
      }
      const user_id = decodedAT.id
      const result = await this.cartService.addToCart(user_id, body)
      SuccessResponse.ok(result, 'Add to cart is successfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteAllProductFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartId } = req.params
      const decodedAT = req.decoded_accessToken
      const body: removeProductFromCartZodType = req.body
      if (!decodedAT) {
        throw new UnauthorizedError('Access token is expired')
      }
      const user_id = decodedAT.id
      const result = await this.cartService.deleteAllProductFromCart(user_id, cartId, body)
      SuccessResponse.ok(result, 'Product removed from cart successfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
