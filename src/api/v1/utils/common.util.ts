import mongoose from 'mongoose'

export const convertObjectIdToString = (ObjectId: mongoose.Types.ObjectId) => {
  return ObjectId.toString()
}

export const convertStringToObjectId = (id: string) => {
  const objectId = new mongoose.Types.ObjectId(id)
  return objectId
}

export function formatToE164(vietnamPhoneNumber: string) {
  // Bỏ khoảng trắng và dấu gạch ngang
  const cleaned = vietnamPhoneNumber.replace(/[\s-]/g, '')

  // Nếu bắt đầu bằng 0, bỏ số 0 và thêm +84
  if (cleaned.startsWith('0')) {
    return '+84' + cleaned.substring(1)
  }

  // Nếu bắt đầu bằng 84, thêm +
  if (cleaned.startsWith('84')) {
    return '+' + cleaned
  }

  // Nếu đã có +84, trả về nguyên
  if (cleaned.startsWith('+84')) {
    return cleaned
  }

  return cleaned
}
