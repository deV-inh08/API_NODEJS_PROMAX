import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { CreateCommentZodType } from '~/api/v1/validations/comment.validation'
import { CommentRepository } from '~/api/v1/repositories/comment.repository'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
import { ProductRepository } from '~/api/v1/repositories/product.repository'

export class CommentService {
  private commentRepository: CommentRepository
  private productRepository: ProductRepository
  constructor() {
    this.commentRepository = new CommentRepository()
    this.productRepository = new ProductRepository()
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
        const parentComment = await CommentModel.findById(parentCommentId)
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

  async getCommentsByParentId(
    body: {
      productId: string
      parentCommentId: string
    },
    limit = 50,
    skip = 0
  ) {
    try {
      const CommentModel = await this.commentRepository.getCommentModel()
      const { parentCommentId, productId } = body
      if (parentCommentId) {
        const parent = await CommentModel.findById(parentCommentId)
        if (!parent) throw new NotFoundError('Not found comment for product')
        const comments = await CommentModel.find({
          comment_productId: convertStringToObjectId(productId),
          comment_left: {
            $gt: parent.comment_left
          },
          comment_right: {
            $lt: parent.comment_right
          }
        })
          .sort({
            comment_left: 1
          })
          .select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
          })
          .skip(skip)
          .limit(limit)
        return comments
      }
      const comments = await CommentModel.find({
        comment_productId: convertStringToObjectId(productId),
        comment_parentId: undefined
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1
        })
        .sort({
          comment_left: 1
        })
        .skip(skip)
        .limit(limit)
      return comments
    } catch (error) {
      throw new BadRequestError('Get list comments failed')
    }
  }

  async deleteComment(commentId: string, productId: string) {
    try {
      // find product
      const foundProduct = await this.productRepository.findProduct({ productId, unSelect: ['__v'] })
      if (!foundProduct) throw new NotFoundError('Product not found')

      // find comment by id
      const comment = await this.commentRepository.findCommentWithId(commentId)
      if (!comment) throw new NotFoundError('Comment not found')
      const leftValue = comment.comment_left
      const rightValue = comment.comment_right

      // caculator witd = right - left + 1
      const width = rightValue - leftValue + 1

      // delete all comments children
      await this.commentRepository.deleteAllCommentsChildren(productId, leftValue, rightValue)

      // update left & right
      await this.commentRepository.updateValue(productId, width, rightValue, 'left')
      await this.commentRepository.updateValue(productId, width, rightValue, 'right')

      return true
    } catch (error) {
      throw new BadRequestError('Delete comment failed')
    }
  }
}
