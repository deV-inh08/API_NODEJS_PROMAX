import z from 'zod'
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().trim(),
    shopId: z.string().trim(),
    quantity: z.number().min(1),
    variant: z.object({
      size: z.string(),
      color: z.string(),
      style: z.string().optional()
    })
  })
})

export type addToCartZodType = z.infer<typeof addToCartSchema>['body']

export const removeProductFromCartSchema = z.object({
  params: z.object({
    cartId: z.string().min(24).max(24, 'Invalid cart ID')
  }),
  body: z.object({
    shopId: z.string().trim(),
    productId: z.string().trim(),
    variant: z
      .object({
        size: z.string(),
        color: z.string(),
        style: z.string().optional()
      })
      .optional()
  })
})
export type removeProductFromCartZodType = z.infer<typeof removeProductFromCartSchema>['body']
