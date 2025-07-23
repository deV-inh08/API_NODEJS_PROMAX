import { isClothingProduct, isElectronicsProduct, isFurnitureProduct } from '~/api/v1/helpers/product.helper'
import { ProductRepository } from '~/api/v1/repositories/product.repository'
import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import {
  IClothing,
  IClothingAttributes,
  IElectronics,
  IElectronicsAttributes,
  IFurniture,
  IFurnitureAttributes,
  IProduct,
  IProductVariation
} from '~/api/v1/types/product.type'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
import { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } from '~/api/v1/utils/response.util'
import { CreateProductType } from '~/api/v1/validations/product.validation'

// class ProductFactory {
//   static async createProduct(productData: CreateProductType, shopId: string) {
//     if (isElectronicsProduct(productData)) {
//       return this.createElectronicsProduct(productData, shopId)
//     } else if (isClothingProduct(productData)) {
//       return this.createClothingProduct(productData, shopId)
//     } else if (isFurnitureProduct(productData)) {
//       return this.createFunitureProduct(productData, shopId)
//     } else {
//       throw new ValidationError(`Unsupported product type: ${productData}`)
//     }
//   }

//   private static createElectronicsProduct(data: CreateProductType & { product_type: 'Electronics' }, shopId: string) {
//     const electronicAttribute = this.validateAttributeElectronicProduct(data.product_attributes)
//     return {
//       ...data,
//       shop_id: convertStringToObjectId(shopId),
//       product_attributes: electronicAttribute,
//       product_slug: this.generateSlug(data.product_name),
//       isActive: true,
//       isPublished: data.isPublished || false,
//     }
//   }

//   private static createClothingProduct(data: CreateProductType & { product_type: 'Clothing' }, shopId: string) {
//     const clothingAttribute = this.validateAttributeClothingProduct(data.product_attributes)
//     return {
//       ...data,
//       shop_id: convertStringToObjectId(shopId),
//       product_attributes: clothingAttribute,
//       product_slug: this.generateSlug(data.product_name),
//       isActive: true,
//       isPublished: data.isPublished || false,
//     }
//   }

//   private static createFunitureProduct(data: CreateProductType & { product_type: 'Furniture' }, shopId: string) {
//     const funitureAttribute = this.validateAttributeFurnitureProduct(data.product_attributes)
//     return {
//       ...data,
//       shop_id: convertStringToObjectId(shopId),
//       product_attributes: funitureAttribute,
//       product_slug: this.generateSlug(data.product_name),
//       isActive: true,
//       isPublished: data.isPublished || false
//     }
//   }

//   private static validateAttributeClothingProduct(attributes: IClothingAttributes) {
//     if (!attributes.size || attributes.size.length === 0) {
//       throw new ValidationError('At least one size is required for clothing')
//     }

//     // không có chất liệu
//     if (!attributes.material) {
//       throw new ValidationError('Material is required for clothing')
//     }

//     return {
//       brand: attributes.brand.trim(),
//       size: attributes.size.map((s: string) => s.toUpperCase()),
//       material: attributes.material.trim(),
//       color: attributes.color?.trim(),
//       style: attributes.style?.trim()
//     }
//   }

//   private static validateAttributeElectronicProduct(attributes: IElectronicsAttributes) {
//     if (!attributes.brand) throw new ValidationError('Brand is required for electronics')
//     if (!attributes.model) throw new ValidationError('Model is required for electronics')
//     if (!attributes.warranty) throw new ValidationError('Warranty is required for electronics')
//     // Validate warranty format (e.g., "12 months", "2 years")
//     const warrantyRegex = /^(\d+)\s+(month|months|year|years)$/i
//     if (!warrantyRegex.test(attributes.warranty)) {
//       throw new ValidationError('Invalid warranty format. Use "12 months" or "2 years"')
//     }
//     return {
//       brand: attributes.brand.trim(),
//       model: attributes.model.trim(),
//       warranty: attributes.warranty.trim(),
//       specifications: attributes.specifications
//     }
//   }
//   private static validateAttributeFurnitureProduct(attributes: IFurnitureAttributes) {
//     if (!attributes.dimensions) {
//       throw new ValidationError('Dimensions are required for furniture')
//     }
//     const { height, length, width, weight, unit } = attributes.dimensions
//     if (!length || !width || !height || !weight) {
//       throw new ValidationError('Complete dimensions (L×W×H, weight) required for furniture')
//     }
//     // Validate reasonable dimensions (not too big/small)
//     if (length > 500 || width > 500 || height > 500) {
//       throw new ValidationError('Furniture dimensions seem too large (max 500cm)')
//     }
//     return {
//       brand: attributes.brand.trim(),
//       material: attributes.material.trim(),
//       dimensions: {
//         length: length,
//         width: width,
//         height: height,
//         unit: unit || 'cm',
//         weight: weight
//       }
//     }
//   }

//   private static generateSlug(productName: string): string {
//     return (
//       productName
//         .toLowerCase()
//         .replace(/[^a-z0-9\s]/g, '')
//         .replace(/\s+/g, '-')
//         .replace(/-+/g, '-')
//         .replace(/^-|-$/g, '') +
//       '-' +
//       Date.now()
//     )
//   }
// }

// export class ProductService {
//   private productRepository: ProductRepository
//   private shopRepository: ShopRepository

//   constructor() {
//     this.productRepository = new ProductRepository()
//     this.shopRepository = new ShopRepository()
//   }

//   createProduct = async (productData: CreateProductType, userId: string) => {
//     try {
//       const shop = await this.validateSellerShop(userId)

//       const productEntity = await ProductFactory.createProduct(productData, shop._id.toString())
//       if (!productEntity) {
//         throw new BadRequestError('Do not create product')
//       }
//       // save to DB
//       const saveProduct = await this.productRepository.createProduct(productEntity)
//       return {
//         id: saveProduct._id,
//         product_name: saveProduct.product_name,
//         product_type: saveProduct.product_type,
//         product_slug: saveProduct.product_slug,
//         product_variations: saveProduct.product_variations,
//         isPublished: saveProduct.isPublished,
//         createdAt: saveProduct.createdAt
//       }
//     } catch (error) {
//       // Re-throw known errors
//       if (error instanceof BadRequestError) {
//         throw error
//       }
//       // Wrap unknown errors
//       throw new BadRequestError('Failed to create product', error)
//     }
//   }

//   async validateSellerShop(userId: string) {
//     // validate shop
//     const shop = await this.shopRepository.findShopByUserId(userId)

//     if (!shop) {
//       throw new NotFoundError('Shop not found. Please register as a seller')
//     }

//     if (!shop.is_verified) {
//       throw new UnauthorizedError('Shop must be verified to create products. Please complete verification process.')
//     }

//     if (shop.status !== 'active') {
//       throw new UnauthorizedError(`Shop is ${shop.status}. Only active shops can create products.`)
//     }
//     return shop
//   }
// }


class ProductFactory {
  static createBaseProduct(productData: CreateProductType, shopId: string) {
    return {
      product_name: productData.product_name.trim(),
      product_thumb: productData.product_thumb,
      product_description: productData.product_description.trim(),
      product_price: productData.product_price,
      product_quantity: productData.product_quantity,
      product_type: productData.product_type,
      shop_id: convertStringToObjectId(shopId),
      product_slug: this.generateSlug(productData.product_name),
      isActive: true,
      isPublished: productData.isPublished || false,

      // ❌ KHÔNG CÓ attributes_id - sẽ update sau
    }
  }

  private static generateSlug(productName: string): string {
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' + Date.now()
  }
}


class AttributeFactory {
  static createAttributes(productData: CreateProductType, productId: string) {
    if (isElectronicsProduct(productData)) {
      return this.createElectronicsAttributes(productData.product_attributes, productId)
    } else if (isClothingProduct(productData)) {
      return this.createClothingAttributes(productData.product_attributes, productId)
    } else if (isFurnitureProduct(productData)) {
      return this.createFurnitureAttributes(productData.product_attributes, productId)
    } else {
      throw new ValidationError(`Unsupported product type: ${productData}`)
    }
  }

  private static createElectronicsAttributes(attributes: any, productId: string) {
    const validatedAttrs = this.validateElectronicsAttributes(attributes)
    return {
      product_id: convertStringToObjectId(productId),
      brand: validatedAttrs.brand,
      model: validatedAttrs.model,
      warranty: validatedAttrs.warranty,
      specifications: validatedAttrs.specifications
    }
  }

  private static createClothingAttributes(attributes: any, productId: string) {
    const validatedAttrs = this.validateClothingAttributes(attributes)
    return {
      product_id: convertStringToObjectId(productId),
      brand: validatedAttrs.brand,
      size: validatedAttrs.size,
      material: validatedAttrs.material,
      color: validatedAttrs.color,
      style: validatedAttrs.style
    }
  }

  private static createFurnitureAttributes(attributes: any, productId: string) {
    const validatedAttrs = this.validateFurnitureAttributes(attributes)

    return {
      product_id: convertStringToObjectId(productId),
      brand: validatedAttrs.brand,
      material: validatedAttrs.material,
      dimensions: validatedAttrs.dimensions
    }
  }

  private static validateElectronicsAttributes(attributes: any) {
    if (!attributes.brand?.trim()) {
      throw new ValidationError('Brand is required for electronics')
    }
    if (!attributes.model?.trim()) {
      throw new ValidationError('Model is required for electronics')
    }
    if (!attributes.warranty?.trim()) {
      throw new ValidationError('Warranty is required for electronics')
    }

    const warrantyRegex = /^(\d+)\s+(month|months|year|years)$/i
    if (!warrantyRegex.test(attributes.warranty)) {
      throw new ValidationError('Invalid warranty format. Use "12 months" or "2 years"')
    }

    if (!attributes.specifications || typeof attributes.specifications !== 'object') {
      throw new ValidationError('Electronics must have specifications')
    }

    const specCount = Object.keys(attributes.specifications).length
    if (specCount === 0) {
      throw new ValidationError('At least one specification is required')
    }

    return {
      brand: attributes.brand.trim(),
      model: attributes.model.trim(),
      warranty: attributes.warranty.trim(),
      specifications: attributes.specifications
    }
  }

  private static validateClothingAttributes(attributes: any) {
    if (!attributes.brand?.trim()) {
      throw new ValidationError('Brand is required for clothing')
    }
    if (!attributes.material?.trim()) {
      throw new ValidationError('Material is required for clothing')
    }
    if (!attributes.size || !Array.isArray(attributes.size) || attributes.size.length === 0) {
      throw new ValidationError('At least one size is required for clothing')
    }

    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40']
    const invalidSizes = attributes.size.filter((size: string) =>
      !validSizes.includes(size.toUpperCase())
    )

    if (invalidSizes.length > 0) {
      throw new ValidationError(`Invalid sizes: ${invalidSizes.join(', ')}`)
    }

    return {
      brand: attributes.brand.trim(),
      size: attributes.size.map((s: string) => s.toUpperCase()),
      material: attributes.material.trim(),
      color: attributes.color?.trim() || '',
      style: attributes.style?.trim() || ''
    }
  }

  private static validateFurnitureAttributes(attributes: any) {
    if (!attributes.brand?.trim()) {
      throw new ValidationError('Brand is required for furniture')
    }
    if (!attributes.material?.trim()) {
      throw new ValidationError('Material is required for furniture')
    }
    if (!attributes.dimensions) {
      throw new ValidationError('Dimensions are required for furniture')
    }

    const { length, width, height, weight, unit = 'cm' } = attributes.dimensions

    if (!length || !width || !height || !weight) {
      throw new ValidationError('Complete dimensions (L×W×H, weight) required for furniture')
    }

    if (length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
      throw new ValidationError('All dimensions must be positive numbers')
    }

    if (length > 1000 || width > 1000 || height > 1000) {
      throw new ValidationError('Furniture dimensions seem too large (max 1000cm)')
    }

    if (weight > 10000) {
      throw new ValidationError('Furniture weight seems too heavy (max 10000kg)')
    }

    return {
      brand: attributes.brand.trim(),
      material: attributes.material.trim(),
      dimensions: {
        length: Number(length),
        width: Number(width),
        height: Number(height),
        unit: unit,
        weight: Number(weight)
      }
    }
  }
}


export class ProductService {
  private productRepository: ProductRepository
  private shopRepository: ShopRepository

  constructor() {
    this.productRepository = new ProductRepository()
    this.shopRepository = new ShopRepository()
  }

  createProduct = async (productData: CreateProductType, userId: string) => {
    try {
      // Step 1: Validate seller shop
      const shop = await this.validateSellerShop(userId)

      // Step 2: Business validations

      // Step 3: Check product limits

      // Step 4: Check duplicate product name

      // Step 5: Create product sequentially (no transaction)
      const result = await this.createProductSequential(productData, shop._id.toString())

      console.log('result', result)


    } catch (error) {
      throw new BadRequestError('Create product failed')
    }
  }

  // Validation methods (same as before)
  private async validateSellerShop(userId: string) {
    const shop = await this.shopRepository.findShopByUserId(userId)

    if (!shop) {
      throw new NotFoundError('Shop not found. Please register as a seller first')
    }

    if (!shop.is_verified) {
      throw new UnauthorizedError('Shop must be verified to create products')
    }

    if (shop.status !== 'active') {
      throw new UnauthorizedError(`Shop is ${shop.status}. Only active shops can create products`)
    }

    return shop
  }


  private async createProductSequential(productData: CreateProductType, shopId: string) {
    let createdProduct = null
    let createdAttributes
    try {
      // Step 1: Create base product first
      const baseProductData = ProductFactory.createBaseProduct(productData, shopId)
      createdProduct = await this.productRepository.createProduct(baseProductData)

      // Step 2: Create specific attributes
      const attributeData = AttributeFactory.createAttributes(productData, createdProduct._id.toString())
      createdAttributes = await this.productRepository.createProductAttributes(
        productData.product_type,
        attributeData
      )

      console.log('✅ Attributes created:', createdAttributes._id)

      // Step 3: Update product with attributes_id
      await this.productRepository.updateProductAttributesId(
        createdProduct._id.toString(),
        createdAttributes._id.toString()
      )

      console.log('✅ Product linked with attributes')

      return {
        product: {
          ...createdProduct.toObject(),
          attributes_id: createdAttributes._id
        },
        attributes: createdAttributes
      }

    } catch (error) {
      // 🔥 MANUAL CLEANUP nếu có lỗi
      console.error('❌ Error during product creation:', error)

      // Cleanup: Delete created documents nếu có lỗi
      if (createdAttributes) {
        try {
          await this.productRepository.deleteProductAttributes(
            productData.product_type,
            createdAttributes._id.toString()
          )
          console.log('🧹 Cleaned up orphaned attributes')
        } catch (cleanupError) {
          console.error('⚠️ Failed to cleanup attributes:', cleanupError)
        }
      }

      if (createdProduct) {
        try {
          await this.productRepository.deleteProduct(createdProduct._id.toString())
          console.log('🧹 Cleaned up orphaned product')
        } catch (cleanupError) {
          console.error('⚠️ Failed to cleanup product:', cleanupError)
        }
      }

      throw error
    }
  }
}