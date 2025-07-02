import mongoose, { Schema } from 'mongoose'
import { IUser } from '~/api/v1/types/user.type'
import { UserMessage } from '~/api/v1/constants/messages.constant'
import { ISocialAccounts } from '~/api/v1/types/user.type'
import { addressSchema } from '~/api/v1/models/address.model'
import { cartSchema } from '~/api/v1/models/cart.model'
import { GenderObject, StatusUser } from '~/api/v1/constants/common.constant'

const socialAccountsSchema = new Schema<ISocialAccounts>({
  facebookId: {
    type: String
  },
  googleId: {
    type: String
  }
})

export const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, UserMessage.EMAIL_IS_REQUIRED],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, UserMessage.EMAIL_IS_INVALID]
  },
  password: {
    type: String,
    required: [true, UserMessage.PASSWORD_IS_REQUIRED],
    minlength: [6, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50]
  },
  firstName: {
    type: String,
    required: [true, UserMessage.FIRST_NAME_IS_REQUIRED],
    trim: true,
    maxlength: [50, UserMessage.FIRST_NAME_LENGTH_MUST_BE_FROM_6_TO_50]
  },

  lastName: {
    type: String,
    required: [true, UserMessage.LAST_NAME_IS_REQUIRED],
    trim: true,
    maxlength: [50, UserMessage.LAST_NAME_LENGTH_MUST_BE_FROM_6_TO_50]
  },

  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, UserMessage.PHONE_NUMBER_INVALID]
  },

  dateOfBirth: {
    type: Date,
    validate: {
      validator: function (date: Date) {
        return date < new Date()
      },
      message: UserMessage.DATE_OF_BIRTH_INVALID
    }
  },

  gender: {
    type: String,
    enum: {
      values: [GenderObject.male, GenderObject.female, GenderObject.other]
    },
    default: GenderObject.other
  },

  avatar: {
    type: String,
    default: null
  },

  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: {
      values: [StatusUser.active, StatusUser.inactive, StatusUser.suspended, StatusUser.deleted],
      message: 'Trạng thái không hợp lệ'
    },
    default: StatusUser.active
  },

  role: {
    type: String,
    enum: {
      values: ['customer', 'admin', 'seller'],
      message: 'Vai trò không hợp lệ'
    },
    default: 'customer'
  },

  // Statistics
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Tổng đơn hàng không được âm']
  },

  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Tổng chi tiêu không được âm']
  },

  address: [addressSchema],
  cart: [cartSchema],
  wishList: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Product'
    }
  ],

  // Security Fields
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordExpires: Date,

  // Social Accounts
  socialAccounts: {
    type: socialAccountsSchema,
    default: () => ({})
  }
})
