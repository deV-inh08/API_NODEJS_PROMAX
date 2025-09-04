import z from 'zod'

export const shopRegistrationSchema = z.object({
  body: z.object({
    shop_name: z
      .string({
        required_error: 'Shop name is required'
      })
      .min(3, 'Shop name must be at least 3 characters')
      .max(100, 'Shop name cannot exceed 100 characters')
      .trim(),
    shop_phone: z
      .string({
        required_error: 'Phone number is required'
      })
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),

    shop_email: z
      .string({
        required_error: 'Email is required'
      })
      .email({ message: 'Invalid email format' })
      .toLowerCase()
      .trim(),
    shop_description: z.string().max(500, 'Shop description cannot exceed 500 characters').trim().optional(),
    shop_logo: z.string().url('Shop logo must be a valid URL').optional(),
    shop_banner: z.string().url('Shop banner must be a valid URL').optional(),
    business_type: z.enum(['individual', 'company']).default('individual'),
    owner_info: z.object({
      full_name: z
        .string({
          required_error: 'FullName ower is require'
        })
        .max(50),
      avatar: z.string().max(200).optional()
    }),
    tax_id: z
      .string()
      .regex(/^[0-9-]+$/, 'Invalid tax ID format')
      .optional(),
    address: z.object({
      city: z.string().min(1, 'City is required'),
      state: z.string().optional(),
      country: z.string().min(1, 'Country is required')
    })
  })
})
export type shopRegistrationZodType = z.infer<typeof shopRegistrationSchema>['body']

// ✅ Step 2: Verify email and send phone OTP
export const verifyEmailSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    emailOTP: z.string().length(6, 'Email OTP must be 6 digits')
  })
})

export type verifyEmailZodType = z.infer<typeof verifyEmailSchema>['body']

// ✅ Step 3: Verify phone and create shop
export const verifyPhoneSchema = z.object({
  body: z.object({
    sessionId: z
      .string({ required_error: 'Session ID is required' })
      .min(10, 'Invalid session ID')
      .regex(/^shop_/, 'Invalid session ID format'),

    firebaseIdToken: z
      .string({ required_error: 'Firebase ID token is required' })
      .min(100, 'Invalid Firebase ID token')
      .max(4096, 'Firebase ID token too long')
      .refine((token) => {
        // JWT format validation
        const parts = token.split('.')
        return parts.length === 3 && parts.every((part) => part.length > 0)
      }, 'Invalid Firebase ID token format')
  })
})
export type verifyPhoneZodType = z.infer<typeof verifyPhoneSchema>['body']
