import {
  ClothingAttributes,
  CreateProductType,
  ElectronicsAttributes,
  FurnitureAttributes
} from '~/api/v1/validations/product.validation'

// 🎯 Type Guards cho type safety
export function isElectronicsProduct(product: CreateProductType): product is CreateProductType & {
  product_type: 'Electronics'
  product_attributes: ElectronicsAttributes
} {
  return product.product_type === 'Electronics'
}

export function isClothingProduct(product: CreateProductType): product is CreateProductType & {
  product_type: 'Clothing'
  product_attributes: ClothingAttributes
} {
  return product.product_type === 'Clothing'
}

export function isFurnitureProduct(product: CreateProductType): product is CreateProductType & {
  product_type: 'Furniture'
  product_attributes: FurnitureAttributes
} {
  return product.product_type === 'Furniture'
}
