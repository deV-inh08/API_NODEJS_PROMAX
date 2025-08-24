import mongoose from 'mongoose'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IComment } from '~/api/v1/types/comment.type'
import { commentSchema } from '~/api/v1/models/comment.model'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'

export class CommentRepository extends BaseRepository {
  private model = new Map<string, mongoose.Model<IComment>>()

  async getCommentModel() {
    if (!this.model.has(this.dbName)) {
      const connection = await this.getConnection()
      const commentModel = await connection.model('Comments', commentSchema)
      this.model.set(this.dbName, commentModel)
    }
    return this.model.get(this.dbName)!
  }


  async findCommentWithId(commentId: string) {
    const commentModel = await this.getCommentModel()
    return commentModel.findById(commentId).lean()
  }

  async deleteAllCommentsChildren(productId: string, leftValue: number, rightValue: number) {
    const commentModel = await this.getCommentModel()
    return commentModel.deleteMany({
      comment_productId: convertStringToObjectId(productId),
      comment_left: {
        $gte: leftValue, // > leftValue
        $lte: rightValue // < right value
      }
    }).lean()
  }

  async updateValue(productId: string, width: number, rightValue: number, condition: 'left' | 'right') {
    const commentModel = await this.getCommentModel()
    if (condition === 'left') {
      return commentModel.updateMany({
        comment_productId: convertStringToObjectId(productId),
        comment_left: {
          $gt: rightValue
        }
      }, {
        $inc: {
          comment_left: -width
        }
      })
    } else {
      return commentModel.updateMany({
        comment_productId: convertStringToObjectId(productId),
        comment_right: {
          $gt: rightValue
        }
      }, {
        $inc: {
          comment_right: -width
        }
      })
    }
  }
}
