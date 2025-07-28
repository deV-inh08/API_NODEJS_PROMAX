import z from 'zod'
export const createDiscountSchema = z.object({
  body: z.object({
    discount_code: z
      .string({
        required_error: 'discount_code is required'
      })
      .trim()
      .toUpperCase()
      .max(10),
    discount_name: z.string({
      required_error: 'discount_name is required'
    }),
    discount_description: z.string({
      required_error: 'discount_description is required'
    }),
    discount_type: z
      .string({
        required_error: 'discount_type'
      })
      .default('fixed_amount'),
    discount_value: z.number({
      required_error: 'discount_value is required'
    }),
    discount_start_date: z.date({
      required_error: 'discount_start_date is required'
    }),
    discount_end_date: z.date({
      required_error: 'discount_end_date is required'
    }),
    discount_max_uses: z.number({
      required_error: 'discount_max_uses is required'
    }),
    discount_max_uses_per_user: z.number({
      required_error: 'discount_max_uses_per_user is required'
    }),
    discount_min_order_value: z.number({
      required_error: 'discount_min_order_value_user is required'
    }),
    discount_is_active: z
      .boolean({
        required_error: 'discount_is_active is required'
      })
      .default(true),
    discount_applies_to: z.enum(['all', 'specific']),
    discount_product_ids: z.array(z.string(), {
      required_error: 'discount_product_ids is required'
    })
  })
})

export type createDiscountZodType = z.infer<typeof createDiscountSchema>['body']
