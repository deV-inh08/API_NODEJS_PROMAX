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

    owner_info: z.object({
      full_name: z.string({
        required_error: 'FullName ower is require'
      }).max(50),
      avatar: z.string()
    }),

    shop_description: z.string().max(500, 'Shop description cannot exceed 500 characters').trim().optional(),

    shop_logo: z.string().url('Shop logo must be a valid URL').optional(),

    business_type: z.enum(['individual', 'company']).default('individual'),

    tax_id: z.string().optional(),

    shop_phone: z
      .string({
        required_error: 'Phone number is required'
      })
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),

    shop_email: z.string({
      required_error: 'Email is required'
    })
      .email({ message: 'Invalid email format' })
      .toLowerCase()
      .trim(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().optional(),
      country: z.string().min(1, 'Country is required'),
      postal_code: z.string().optional()
    })
  })
})
export type shopRegistrationZodType = z.infer<typeof shopRegistrationSchema>['body']
