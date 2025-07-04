import z from 'zod'
import { UserMessage } from '~/api/v1/constants/messages.constant'
import { JWTServices } from '~/api/v1/utils/jwt.util'

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: UserMessage.EMAIL_IS_REQUIRED
      })
      .email(UserMessage.EMAIL_IS_INVALID)
      .toLowerCase()
      .trim(),
    password: z
      .string({
        required_error: UserMessage.PASSWORD_IS_REQUIRED
      })
      .min(6, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
      .max(50, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50),

    firstName: z
      .string({
        required_error: UserMessage.FIRST_NAME_IS_REQUIRED
      })
      .min(2, UserMessage.FIRST_NAME_LENGTH_MUST_BE_FROM_6_TO_50)
      .max(50, UserMessage.FIRST_NAME_LENGTH_MUST_BE_FROM_6_TO_50)
      .trim(),

    lastName: z
      .string({
        required_error: UserMessage.LAST_NAME_IS_REQUIRED
      })
      .min(2, UserMessage.LAST_NAME_LENGTH_MUST_BE_FROM_6_TO_50)
      .max(50, UserMessage.LAST_NAME_LENGTH_MUST_BE_FROM_6_TO_50)
      .trim(),

    phoneNumber: z
      .string()
      .regex(/^[0-9+\-\s()]+$/, UserMessage.PHONE_NUMBER_INVALID)
      .optional(),

    dateOfBirth: z
      .string()
      .transform((str) => new Date(str))
      .refine((date) => date < new Date(), UserMessage.DATE_OF_BIRTH_INVALID)
      .optional(),

    gender: z.enum(['male', 'female', 'other']).optional().default('other')
  })
})
export type registerZodType = z.infer<typeof registerSchema>['body']

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: UserMessage.EMAIL_IS_REQUIRED })
      .email(UserMessage.EMAIL_IS_INVALID)
      .toLowerCase()
      .trim(),

    password: z.string({ required_error: UserMessage.PASSWORD_IS_REQUIRED }).min(1, 'Password is required')
  })
})

export type loginZodType = z.infer<typeof loginSchema>['body']

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        required_error: 'RefreshToken is required'
      })
      .min(1, 'Refresh token cannot be empty')
      .refine((token) => {
        return JWTServices.validateJWTFormat(token)
      }, 'Invalid refresh token format')
  })
})

export type logoutZodType = z.infer<typeof logoutSchema>['body']

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({
        required_error: UserMessage.PASSWORD_IS_REQUIRED
      })
      .min(6, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
      .max(50, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50),

    newPassword: z
      .string({
        required_error: UserMessage.NEW_PASSWORD_IS_REQUIRED
      })
      .min(6, UserMessage.NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
      .max(50, UserMessage.NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50),

    confirmPassword: z.string({
      required_error: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED
    })
  })
})
