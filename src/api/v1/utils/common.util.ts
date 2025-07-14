import mongoose from 'mongoose'

export const convertObjectIdToString = (ObjectId: mongoose.Types.ObjectId) => {
  return ObjectId.toString()
}

export const convertStringToObjectId = (id: string) => {
  const objectId = new mongoose.Types.ObjectId(id)
  return objectId
}
