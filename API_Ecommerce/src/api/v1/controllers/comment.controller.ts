import { CommentService } from '~/api/v1/services/comment.service'
import type { Request, Response, NextFunction } from 'express'
import { CreateCommentZodType, DeleteComentZodType } from '~/api/v1/validations/comment.validation'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'

export class CommentController {
  private commentService: CommentService
  constructor() {
    this.commentService = new CommentService()
  }

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('AT is expired')
      }
      const userId = decodedAT.id
      const body: CreateCommentZodType = req.body
      const result = await this.commentService.createComment({ ...body, userId })
      SuccessResponse.created(result, 'Comment create successfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  getCommentsByParentId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('AT is expired')
      }
      const { productId, parentCommentId } = req.query as {
        productId: string
        parentCommentId: string
      }
      const result = await this.commentService.getCommentsByParentId({ productId, parentCommentId })
      SuccessResponse.ok(result, 'Get list comments succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('AccessToken is expired')
      }
      const body: DeleteComentZodType = req.body
      const { commentId, productId } = body
      const result = await this.commentService.deleteComment(commentId, productId)
      SuccessResponse.ok(result, 'Comment deleted successfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
