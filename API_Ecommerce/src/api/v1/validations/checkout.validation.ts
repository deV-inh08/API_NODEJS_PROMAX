import z from 'zod'

// Schema cho item_products
const ItemProductSchema = z.object({
  price: z.number().positive('Giá phải là số dương'),
  quantity: z.number().int().positive('Số lượng phải là số nguyên dương'),
  productId: z.string().min(1, 'ProductId không được để trống')
})

// Schema cho shop_discounts
const ShopDiscountSchema = z.object({
  discountId: z.string().min(1, 'Discount ID không được để trống'),
  discountcode: z.string().min(1, 'Code ID không được để trống')
})

const shopOrderIdsSchema = z.object({
  shop_id: z.string().min(1, 'Shop ID không được để trống'),
  shop_discounts: z.array(ShopDiscountSchema),
  item_products: z.array(ItemProductSchema)
})

export const checkoutSchema = z.object({
  body: z.object({
    cartId: z.string().trim(),
    shop_order_ids: z.array(shopOrderIdsSchema)
  })
})

export type shopOrderIdsZodType = z.infer<typeof shopOrderIdsSchema>
export type checkoutSchemaZodType = z.infer<typeof checkoutSchema>['body']
