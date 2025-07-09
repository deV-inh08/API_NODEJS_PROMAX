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
  body: z
    .object({
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
        .max(50, UserMessage.NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
        //  Password strength validation
        .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/^(?=.*\d)/, 'Password must contain at least one number')
        .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character')
        //  No spaces allowed
        .refine((password) => !password.includes(' '), 'Password cannot contain spaces'),

      confirmPassword: z.string({
        required_error: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED
      })
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirm password don't match",
      path: ['confirmPassword'] // ⭐ Error sẽ hiển thị ở field confirmPassword
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword']
    })
})

export type changePasswordZodType = z.infer<typeof changePasswordSchema>['body']

export const requestOTPSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required'
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim()
  })
})

export type forgotPasswordZodType = z.infer<typeof requestOTPSchema>['body']

export const verifyOTPSchema = z.object({
  body: z.object({
    otp: z.string({ required_error: 'OTP is requred' }).min(6, {
      message: 'OTP must be 6 digits'
    }),
    email: z
      .string({
        required_error: 'Email is required'
      })
      .email('Invalid email format')
      .toLowerCase()
      .trim()
  })
})

export type verifyOTPZodType = z.infer<typeof verifyOTPSchema>['body']

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: 'Email is required'
        })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
      password: z
        .string({
          required_error: UserMessage.PASSWORD_IS_REQUIRED
        })
        .min(6, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
        .max(50, UserMessage.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50)
        //  Password strength validation
        .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/^(?=.*\d)/, 'Password must contain at least one number')
        .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character')
        //  No spaces allowed
        .refine((password) => !password.includes(' '), 'Password cannot contain spaces'),
      confirmPassword: z.string({
        required_error: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password don't match",
      path: ['confirmPassword']
    })
})

export type resetPasswordZodType = z.infer<typeof resetPasswordSchema>['body']