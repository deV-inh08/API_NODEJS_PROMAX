import z from 'zod'
import { JWTServices } from '~/api/v1/utils/jwt.util'

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Refresh token is required' })
      .min(1, 'Refresh token cannot be empty')
      .max(2048, 'Refresh token too long')
      .refine((token) => {
        // lenght validation
        return token.length >= 100 && token.length <= 2048
      }, 'Invalid refresh token length')
      .refine((token) => {
        // Basic decoded token
        const decoded = JWTServices.decodedToken(token)
        return decoded && typeof decoded === 'object' && 'id' in decoded // Có decodedToken và decoded Token phải là Object và có thuộc tính 'id' mới pass được
      }, 'Invalid refresh token structure')
      .refine((token) => {
        return JWTServices.validateJWTFormat(token)
      }, 'Invalid refresh token format')
  })
})

export type refreshTokenZodType = z.infer<typeof refreshTokenSchema>['body']
