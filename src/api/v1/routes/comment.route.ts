import { Router } from 'express'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { CommentController } from '~/api/v1/controllers/comment.controller'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { CreateCommentSchema, DeleteCommentSchema } from '~/api/v1/validations/comment.validation'

export const commentRouter = Router()
const authMiddleware = new AuthMiddleWare()
const commentController = new CommentController()

commentRouter.post(
  '/create',
  authMiddleware.verifyAT,
  validationReq(CreateCommentSchema),
  commentController.createComment
)

commentRouter.get('/', authMiddleware.verifyAT, commentController.getCommentsByParentId)

// delete comment
commentRouter.delete(
  '/delete',
  authMiddleware.verifyAT,
  validationReq(DeleteCommentSchema),
  commentController.deleteComment
)
