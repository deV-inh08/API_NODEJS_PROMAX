import z from 'zod'

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
  color: z.string().optional(),
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
  body: z
    .object({
      product_name: z.string().min(3).max(200).trim(),
      product_thumb: z.string().url(),
      product_description: z.string().min(10).max(2000).trim(),
      product_price: z.number().positive().max(999999999),
      product_quantity: z.number().int().min(0),
      product_type: z.enum(['Electronics', 'Clothing', 'Furniture']),
      isPublished: z.boolean().default(false),
      product_attributes: z.record(z.any()) // ✅ Accept any object
    })

})

// ========== TYPE EXPORTS ==========
export type CreateProductType = z.infer<typeof createProductSchema>['body']

// Type-safe attribute extractors
export type ElectronicsAttributes = z.infer<typeof electronicsAttributesSchema>
export type ClothingAttributes = z.infer<typeof clothingAttributesSchema>
export type FurnitureAttributes = z.infer<typeof furnitureAttributesSchema>
