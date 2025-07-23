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

class ProductFactory {
  static async createProduct(productData: CreateProductType, shopId: string) {
    if (isElectronicsProduct(productData)) {
      return this.createElectronicsProduct(productData, shopId)
    } else if (isClothingProduct(productData)) {
      return this.createClothingProduct(productData, shopId)
    } else if (isFurnitureProduct(productData)) {
      return this.createFunitureProduct(productData, shopId)
    }
  }

  private static createElectronicsProduct(data: CreateProductType & { product_type: 'Electronics' }, shopId: string) {
    const electronicAttribute = this.validateAttributeElectronicProduct(data.product_attributes)
    return {
      ...data,
      product_shop: convertStringToObjectId(shopId),
      product_attributes: electronicAttribute,
      product_slug: this.generateSlug(data.product_name),
      isActive: true
    }
  }

  private static createClothingProduct(data: CreateProductType & { product_type: 'Clothing' }, shopId: string) {
    const clothingAttribute = this.validateAttributeClothingProduct(data.product_attributes)
    return {
      ...data,
      product_shop: convertStringToObjectId(shopId),
      product_attributes: clothingAttribute,
      product_slug: this.generateSlug(data.product_name),
      isActive: true
    }
  }

  private static createFunitureProduct(data: CreateProductType & { product_type: 'Furniture' }, shopId: string) {
    const funitureAttribute = this.validateAttributeFurnitureProduct(data.product_attributes)
    return {
      ...data,
      product_shop: convertStringToObjectId(shopId),
      product_attributes: funitureAttribute,
      product_slug: this.generateSlug(data.product_name),
      isActive: true
    }
  }

  private static validateAttributeClothingProduct(attributes: IClothingAttributes) {
    if (!attributes.size || attributes.size.length === 0) {
      throw new ValidationError('At least one size is required for clothing')
    }

    // không có chất liệu
    if (!attributes.material) {
      throw new ValidationError('Material is required for clothing')
    }

    return {
      brand: attributes.brand.trim(),
      size: attributes.size.map((s: string) => s.toUpperCase()),
      material: attributes.material.trim(),
      color: attributes.color?.trim(),
      style: attributes.style?.trim()
    }
  }

  private static validateAttributeElectronicProduct(attributes: IElectronicsAttributes) {
    if (!attributes.brand) throw new ValidationError('Brand is required for electronics')
    if (!attributes.model) throw new ValidationError('Model is required for electronics')
    if (!attributes.warranty) throw new ValidationError('Warranty is required for electronics')
    // Validate warranty format (e.g., "12 months", "2 years")
    const warrantyRegex = /^(\d+)\s+(month|months|year|years)$/i
    if (!warrantyRegex.test(attributes.warranty)) {
      throw new ValidationError('Invalid warranty format. Use "12 months" or "2 years"')
    }
    return {
      brand: attributes.brand.trim(),
      model: attributes.model.trim(),
      warranty: attributes.warranty.trim(),
      specifications: attributes.specifications
    }
  }
  private static validateAttributeFurnitureProduct(attributes: IFurnitureAttributes) {
    if (!attributes.dimensions) {
      throw new ValidationError('Dimensions are required for furniture')
    }
    const { height, length, width, weight, unit } = attributes.dimensions
    if (!length || !width || !height || !weight) {
      throw new ValidationError('Complete dimensions (L×W×H, weight) required for furniture')
    }
    // Validate reasonable dimensions (not too big/small)
    if (length > 500 || width > 500 || height > 500) {
      throw new ValidationError('Furniture dimensions seem too large (max 500cm)')
    }
    return {
      brand: attributes.brand.trim(),
      material: attributes.material.trim(),
      dimensions: {
        length: length,
        width: width,
        height: height,
        unit: unit || 'cm',
        weight: weight
      }
    }
  }

  private static generateSlug(productName: string): string {
    return (
      productName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()
    )
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
      const shop = await this.validateSellerShop(userId)

      const productEntity = await ProductFactory.createProduct(productData, shop._id.toString())
      if (!productEntity) {
        throw new BadRequestError('Do not create product')
      }
      // save to DB
      const saveProduct = await this.productRepository.createProduct(productEntity)
      return {
        id: saveProduct._id,
        product_name: saveProduct.product_name,
        product_type: saveProduct.product_type,
        product_slug: saveProduct.product_slug,
        product_variations: saveProduct.product_variations,
        isPublished: saveProduct.isPublished,
        createdAt: saveProduct.createdAt
      }
    } catch (error) {
      // Re-throw known errors
      if (error instanceof BadRequestError) {
        throw error
      }
      // Wrap unknown errors
      throw new BadRequestError('Failed to create product', error)
    }
  }

  async validateSellerShop(userId: string) {
    // validate shop
    const shop = await this.shopRepository.findShopByUserId(userId)

    if (!shop) {
      throw new NotFoundError('Shop not found. Please register as a seller')
    }

    if (!shop.is_verified) {
      throw new UnauthorizedError('Shop must be verified to create products. Please complete verification process.')
    }

    if (shop.status !== 'active') {
      throw new UnauthorizedError(`Shop is ${shop.status}. Only active shops can create products.`)
    }
    return shop
  }
}
