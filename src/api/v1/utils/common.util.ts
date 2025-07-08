import mongoose from 'mongoose'

export const convertObjectIdToString = (ObjectId: mongoose.Types.ObjectId) => {
  return ObjectId.toString()
}
