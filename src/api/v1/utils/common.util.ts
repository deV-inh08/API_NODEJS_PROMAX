import mongoose from 'mongoose'
import { IElectronics } from '~/api/v1/types/product.type'

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

export const getSelectData = (select: string[]) => {
  return Object.fromEntries(select.map((e) => [e, 1]))
}

export const unGetSelectData = (select: string[]) => {
  return Object.fromEntries(select.map((e) => [e, 0]))
}

// 🧹 Helper function để clean null/undefined
export function cleanNullUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  if (obj === null || obj === undefined) return {}
  if (typeof obj !== 'object' || Array.isArray(obj)) return obj

  const cleaned: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const cleanedValue = cleanNullUndefined(value as Record<string, unknown>)
        if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue
        }
      } else {
        cleaned[key] = value
      }
    }
  }
  return cleaned
}
