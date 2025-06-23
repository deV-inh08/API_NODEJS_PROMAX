import { Schema } from 'mongoose'
import { IAddress } from '~/api/v1/types/address.type'

export const addressSchema = new Schema<IAddress>({
  type: {
    type: String,
    enum: ['home', 'work'],
    default: 'home'
  },
  fullName: {
    type: String,
    required: [true, 'Tên người nhận là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    match: [/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ']
  },
  addressLine1: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Thành phố là bắt buộc'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Tỉnh/Thành là bắt buộc'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  country: {
    type: String,
    required: [true, 'Quốc gia là bắt buộc'],
    default: 'Vietnam'
  }
})
