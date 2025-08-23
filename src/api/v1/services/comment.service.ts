import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { CreateCommentZodType } from '~/api/v1/validations/comment.validation'
import { CommentRepository } from '~/api/v1/repositories/comment.repository'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'

export class CommentService {
  private commentRepository: CommentRepository

  constructor() {
    this.commentRepository = new CommentRepository()
  }
  async createComment(
    body: CreateCommentZodType & {
      userId: string
    }
  ) {
    try {
      const { content, productId, parentCommentId, userId } = body
      const CommentModel = await this.commentRepository.getCommentModel()
      const comment = new CommentModel({
        comment_productId: productId,
        comment_content: content,
        comment_parentId: parentCommentId,
        comment_userId: userId
      })

      let rightValue = 0
      if (parentCommentId) {
        // reply logic

        const parentComment = await CommentModel.findById({
          parentCommentId
        })
        if (!parentComment) throw new NotFoundError('Parent comment not found')
        rightValue = parentComment.comment_right
        await CommentModel.updateMany(
          {
            comment_productId: convertStringToObjectId(productId),
            comment_right: {
              $gte: rightValue
            }
          },
          { $inc: { comment_right: 2 } }
        )

        await CommentModel.updateMany(
          {
            comment_productId: convertStringToObjectId(productId),
            comment_left: {
              $gt: rightValue
            }
          },
          {
            $inc: { comment_left: 2 }
          }
        )
      } else {
        const maxRightValue = await CommentModel.findOne(
          {
            comment_productId: convertStringToObjectId(productId)
          },
          'comment_right',
          {
            sort: {
              comment_right: -1
            }
          }
        )

        if (maxRightValue) {
          rightValue = maxRightValue.comment_right + 1
        } else {
          rightValue = 1
        }
      }
      comment.comment_left = rightValue
      comment.comment_right = rightValue + 1

      comment.save()
      return comment
    } catch (error) {
      throw new BadRequestError('Create comment failed')
    }
  }
}
