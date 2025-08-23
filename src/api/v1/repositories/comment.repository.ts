import mongoose from 'mongoose'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IComment } from '~/api/v1/types/comment.type'
import { commentSchema } from '~/api/v1/models/comment.model'

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
}
