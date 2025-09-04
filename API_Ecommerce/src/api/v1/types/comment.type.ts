import { Document, Types } from 'mongoose'

// Interface cho Comment Document
export interface IComment extends Document {
  _id: Types.ObjectId
  comment_productId: Types.ObjectId
  comment_userId: Types.ObjectId
  comment_content: string
  comment_left: number
  comment_right: number
  comment_parentId?: Types.ObjectId
  isDeleted: boolean
  comment_level: number
  comment_tree_id: string
  createdAt: Date
  updatedAt: Date
}
