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