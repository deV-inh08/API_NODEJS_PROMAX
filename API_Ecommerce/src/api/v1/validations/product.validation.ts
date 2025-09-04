import { Types } from 'mongoose'
import z from 'zod'
import { cleanNullUndefined } from '~/api/v1/utils/common.util'

// Individual attribute schemas for each product type
const electronicsAttributesSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  warranty: z.string().regex(/^(\d+)\s+(month|months|year|years)$/i, 'Invalid warranty format'),
  specifications: z
    .record(z.string())
    .refine((specs) => Object.keys(specs).length > 0, 'At least one specification required')
})

const clothingAttributesSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  size: z.array(z.string()).min(1, 'At least one size required'),
  material: z.string().min(1, 'Material is required'),
  color: z.array(z.string()),
  style: z.string().optional()
})

const furnitureAttributesSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  material: z.string().min(1, 'Material is required'),
  dimensions: z.object({
    length: z.number().positive('Length must be positive').max(500, 'Too large'),
    width: z.number().positive('Width must be positive').max(500, 'Too large'),
    height: z.number().positive('Height must be positive').max(500, 'Too large'),
    unit: z.enum(['cm', 'inch']).default('cm'),
    weight: z.number().positive('Weight must be positive')
  })
})

// 🎯 Main validation schema với discriminated union
export const createProductSchema = z.object({
  body: z.object({
    product_name: z.string().min(3).max(200).trim(),
    product_thumb: z.string().url(),
    product_description: z.string().min(10).max(2000).trim(),
    product_price: z.number().positive().max(999999999),
    product_quantity: z.number().int().min(0),
    product_type: z.enum(['Electronics', 'Clothing', 'Furniture']),
    isPublished: z.boolean().default(false),
    isDraft: z.boolean().default(true),
    product_attributes: z.record(z.any())
  })
})

// ========== TYPE EXPORTS ==========
export type CreateProductType = z.infer<typeof createProductSchema>['body']
export type BaseProductType = Omit<CreateProductType, 'product_attributes'> & {
  shop_id: Types.ObjectId
  product_slug: string
}

// Type-safe attribute extractors
export type ElectronicsAttributes = z.infer<typeof electronicsAttributesSchema>
export type ClothingAttributes = z.infer<typeof clothingAttributesSchema>
export type FurnitureAttributes = z.infer<typeof furnitureAttributesSchema>

export const updateProductSchema = z.object({
  params: z.object({
    productId: z.string().min(24).max(24, 'Invalid product ID')
  }),
  body: z
    .object({
      product_name: z.string().min(3).max(200).trim().optional(),
      product_thumb: z.string().url('Invalid image URL').optional(),
      product_description: z.string().min(10).max(2000).trim().optional(),
      product_price: z.number().positive().max(999999999).optional(),
      product_quantity: z.number().int().min(0).optional(),
      // 🎯 Fixed: Use z.unknown() và proper typing
      product_attributes: z.record(z.unknown()).optional()
    })
    .transform((data) => {
      const cleaned: {
        product_name?: string
        product_thumb?: string
        product_description?: string
        product_price?: number
        product_quantity?: number
        product_attributes?: Record<string, unknown>
      } = {}

      // Clean basic fields
      if (data.product_name !== null && data.product_name !== undefined) {
        cleaned.product_name = data.product_name
      }
      if (data.product_thumb !== null && data.product_thumb !== undefined) {
        cleaned.product_thumb = data.product_thumb
      }
      if (data.product_description !== null && data.product_description !== undefined) {
        cleaned.product_description = data.product_description
      }
      if (data.product_price !== null && data.product_price !== undefined) {
        cleaned.product_price = data.product_price
      }
      if (data.product_quantity !== null && data.product_quantity !== undefined) {
        cleaned.product_quantity = data.product_quantity
      }

      // Clean attributes
      if (data.product_attributes !== null && data.product_attributes !== undefined) {
        const cleanedAttributes = cleanNullUndefined(data.product_attributes)
        if (Object.keys(cleanedAttributes).length > 0) {
          cleaned.product_attributes = cleanedAttributes
        }
      }

      return cleaned // ✅ IMPORTANT: Return the cleaned object
    })
    .refine(
      (data) => {
        // At least one field must be provided
        return Object.keys(data).length > 0
      },
      {
        message: 'At least one valid field must be provided for update'
      }
    )
})

export type updateProductBodyZodType = z.infer<typeof updateProductSchema>['body']
