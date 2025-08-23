import { Schema } from 'mongoose'
import { IComment } from '~/api/v1/types/comment.type'

export const commentSchema = new Schema<IComment>(
  {
    comment_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    comment_userId: { type: Schema.Types.ObjectId, ref: 'users' },
    comment_content: { type: String, default: 'text' },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    isDeleted: { type: Boolean, default: false },
    comment_level: { type: Number, default: 0 },
    comment_tree_id: { type: String }
  },
  {
    timestamps: true,
    collection: 'Comments'
  }
)
