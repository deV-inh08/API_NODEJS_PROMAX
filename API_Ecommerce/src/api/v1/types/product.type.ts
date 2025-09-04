import { Types } from 'mongoose'
import { FurnitureAttributes, ElectronicsAttributes, ClothingAttributes } from '~/api/v1/validations/product.validation'

// Base Product Interface
export interface IProduct {
  _id: Types.ObjectId
  product_name: string
  product_thumb: string
  product_description: string
  product_price: number
  product_quantity: number
  product_type: 'Electronics' | 'Clothing' | 'Furniture' // more ....
  shop_id: Types.ObjectId // trỏ tới id của shop nào có product này
  attributes_id: Types.ObjectId
  product_ratingsAverage?: number // 4.7/5 star
  product_ratingsCount?: number // Số lượng đánh giá: 120 reviews
  product_variations?: IProductVariation[]
  product_slug: string
  isDraft: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
// const productExample = {
//   _id: ObjectId("60d5ecb54b24b73b9c8d1234"),
//   product_name: "iPhone 15 Pro Max",
//   product_thumb: "https://cdn.apple.com/iphone15-pro-max.jpg",
//   product_description: "Latest iPhone with A17 Pro chip, titanium design...",
//   product_price: 1199.99,
//   product_quantity: 50,
//   product_type: "Electronics",
//   product_shop: ObjectId("60d5ecb54b24b73b9c8d9999"), // Apple Store ID
//   product_attributes: ObjectId("60d5ecb54b24b73b9c8d5678"), // Trỏ tới Electronics collection
//   product_ratingsAverage: 4.7,
//   product_ratingsCount: 1250,
//   product_variations: [
//     {
//       name: "storage",
//       options: ["128GB", "256GB", "512GB", "1TB"]
//     },
//     {
//       name: "color",
//       options: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
//     }
//   ],
//   product_slug: "iphone-15-pro-max",
//   isPublished: true,
//   isActive: true,
//   createdAt: new Date("2024-01-15"),
//   updatedAt: new Date("2024-01-20")
// }

export interface IProductVariation {
  name: string // size, color, style
  options: string[] // ['S', 'M', 'L'] or ['Red', 'Blue']
}

export interface IClothing extends ClothingAttributes {
  _id: Types.ObjectId
  product_id: Types.ObjectId
}
// VÍ DỤ CLOTHING THỰC TẾ:
// const clothingExample = {
//   _id: ObjectId("60d5ecb54b24b73b9c8d5678"),
//  product_id: ObjectId("60d5ecb54b24b73b9c8d5678")
//   brand: "Nike",
//   size: "L" || ['L', 'X', 'M'],
//   material: "100% Cotton",
//   color: "Navy Blue",
//   style: "Casual"
// }

export interface IElectronics extends ElectronicsAttributes {
  _id: Types.ObjectId
  product_id: Types.ObjectId
}
// VÍ DỤ ELECTRONICS THỰC TẾ:
// const electronicsExample = {
//   _id: ObjectId("60d5ecb54b24b73b9c8d5678"),
// product_id: ObjectId("60d5ecb54b24b73b9c8d5678")
//   brand: "Apple",
//   model: "iPhone 15 Pro Max",
//   warranty: "1 year limited warranty",
//   specifications: {
//     "Display": "6.7-inch Super Retina XDR",
//     "Chip": "A17 Pro",
//     "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
//     "Storage": "256GB",
//     "RAM": "8GB",
//     "Battery": "Up to 29 hours video playback",
//     "OS": "iOS 17",
//     "5G": "Yes",
//     "Face ID": "Yes"
//   }
// }

export interface IFurniture extends FurnitureAttributes {
  _id: Types.ObjectId
  product_id: Types.ObjectId
}

// VÍ DỤ FURNITURE THỰC TẾ:
// const furnitureExample = {
//   _id: ObjectId("60d5ecb54b24b73b9c8d5678"),
// product_id: ObjectId("60d5ecb54b24b73b9c8d5678")
//   brand: "IKEA",
//   material: "Solid pine wood with clear lacquer finish",
//   dimensions: {
//     length: 200,      // 200cm
//     width: 90,        // 90cm
//     height: 75,       // 75cm
//     unit: "cm"
//   },
//   weight: 45.5,       // 45.5kg
// }
