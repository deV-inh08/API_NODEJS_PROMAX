import z from 'zod'

// // Create Product Interface (cho API input)
// export interface ICreateProduct {
//   product_name: string
//   product_thumb: string
//   product_description: string
//   product_price: number
//   product_quantity: number
//   product_type: 'Electronics' | 'Clothing' | 'Furniture'
//   product_attributes: IClothingAttributes | IElectronicsAttributes | IFurnitureAttributes
//   isPublished?: boolean
// }

// // Type-safe discriminated unions cho từng loại sản phẩm
// export interface ICreateElectronicsProduct extends Omit<ICreateProduct, 'product_type' | 'product_attributes'> {
//   product_type: 'Electronics'
//   product_attributes: IElectronicsAttributes
// }

// export interface ICreateClothingProduct extends Omit<ICreateProduct, 'product_type' | 'product_attributes'> {
//   product_type: 'Clothing'
//   product_attributes: IClothingAttributes
// }

// export interface ICreateFurnitureProduct extends Omit<ICreateProduct, 'product_type' | 'product_attributes'> {
//   product_type: 'Furniture'
//   product_attributes: IFurnitureAttributes
// }

// // Union type cho tất cả các loại create product
// export type CreateProductInput = ICreateElectronicsProduct | ICreateClothingProduct | ICreateFurnitureProduct

// Individual attribute schemas for each product type
const electronicsAttributesSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  warranty: z.string().regex(/^(\d+)\s+(month|months|year|years)$/i, 'Invalid warranty format'),
  // specifications: z
  //   .record(z.string())
  //   .refine((specs) => Object.keys(specs).length > 0, 'At least one specification required')
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

      // 🎯 KEY POINT: z.any() làm placeholder
      product_attributes: z.any(),

      isPublished: z.boolean().default(false)
    })
    // 🎯 Discriminated union override z.any() thành specific schema
    .and(
      z.discriminatedUnion('product_type', [
        z.object({
          product_type: z.literal('Electronics'),
          product_attributes: electronicsAttributesSchema
        }),
        z.object({
          product_type: z.literal('Clothing'),
          product_attributes: clothingAttributesSchema
        }),
        z.object({
          product_type: z.literal('Furniture'),
          product_attributes: furnitureAttributesSchema
        })
      ])
    )
})

// ========== TYPE EXPORTS ==========
export type CreateProductType = z.infer<typeof createProductSchema>['body']

// Type-safe attribute extractors
export type ElectronicsAttributes = z.infer<typeof electronicsAttributesSchema>
export type ClothingAttributes = z.infer<typeof clothingAttributesSchema>
export type FurnitureAttributes = z.infer<typeof furnitureAttributesSchema>
