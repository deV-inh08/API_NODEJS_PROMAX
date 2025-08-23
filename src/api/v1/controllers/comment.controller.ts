import { CommentService } from "~/api/v1/services/comment.service";
import type { Request, Response, NextFunction } from 'express'
import { CreateCommentZodType } from "~/api/v1/validations/comment.validation";
import { SuccessResponse, UnauthorizedError } from "~/api/v1/utils/response.util";


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
}