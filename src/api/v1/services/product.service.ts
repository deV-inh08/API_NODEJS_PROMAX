import { Types } from 'mongoose'
import { resourceLimits } from 'worker_threads'
import { isClothingProduct, isElectronicsProduct, isFurnitureProduct } from '~/api/v1/helpers/product.helper'
import { ProductRepository } from '~/api/v1/repositories/product.repository'
import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import { convertObjectIdToString, convertStringToObjectId } from '~/api/v1/utils/common.util'
import { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } from '~/api/v1/utils/response.util'
import { CreateProductType, BaseProductType, updateProductBodyZodType } from '~/api/v1/validations/product.validation'
import { FurnitureAttributes, ElectronicsAttributes, ClothingAttributes } from '~/api/v1/validations/product.validation'

class ProductFactory {
  // filter product_attributes
  static createBaseProduct(productData: CreateProductType, shopId: string): BaseProductType {
    return {
      product_name: productData.product_name.trim(),
      product_thumb: productData.product_thumb,
      product_description: productData.product_description.trim(),
      product_price: productData.product_price,
      product_quantity: productData.product_quantity,
      product_type: productData.product_type,
      shop_id: convertStringToObjectId(shopId),
      product_slug: this.generateSlug(productData.product_name),
      isDraft: true,
      isPublished: productData.isPublished || false
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

  private static createElectronicsAttributes(attributes: ElectronicsAttributes, productId: string) {
    const validatedAttrs = this.validateElectronicsAttributes(attributes)
    return {
      product_id: convertStringToObjectId(productId),
      brand: validatedAttrs.brand,
      model: validatedAttrs.model,
      warranty: validatedAttrs.warranty,
      specifications: validatedAttrs.specifications
    }
  }

  private static createClothingAttributes(attributes: ClothingAttributes, productId: string) {
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

  private static createFurnitureAttributes(attributes: FurnitureAttributes, productId: string) {
    const validatedAttrs = this.validateFurnitureAttributes(attributes)

    return {
      product_id: convertStringToObjectId(productId),
      brand: validatedAttrs.brand,
      material: validatedAttrs.material,
      dimensions: validatedAttrs.dimensions
    }
  }

  private static validateElectronicsAttributes(attributes: ElectronicsAttributes) {
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

  private static validateClothingAttributes(attributes: ClothingAttributes) {
    if (!attributes.brand?.trim()) {
      throw new ValidationError('Brand is required for clothing')
    }
    if (!attributes.material?.trim()) {
      throw new ValidationError('Material is required for clothing')
    }
    if (!attributes.size || !Array.isArray(attributes.size) || attributes.size.length === 0) {
      throw new ValidationError('At least one size is required for clothing')
    }

    const _CLOTHING_SIZE = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40']
    const _SHOES_SIZE = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

    const validSizes = [..._CLOTHING_SIZE, ..._SHOES_SIZE]
    const invalidSizes = attributes.size.filter((size: string) => !validSizes.includes(size.toUpperCase()))

    if (invalidSizes.length > 0) {
      throw new ValidationError(`Invalid sizes: ${invalidSizes.join(', ')}`)
    }

    return {
      brand: attributes.brand.trim(),
      size: attributes.size.map((s: string) => s.toUpperCase()),
      material: attributes.material.trim(),
      color: attributes.color || [],
      style: attributes.style?.trim() || ''
    }
  }

  private static validateFurnitureAttributes(attributes: FurnitureAttributes) {
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

      // Step 2: Create product sequentially (no transaction)
      const result = await this.createProductSequential(productData, shop._id.toString())
      return result
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

  // 🔧 Helper methods
  private hasBasicFieldUpdate(updateData: updateProductBodyZodType): boolean {
    return !!(
      updateData.product_name ||
      updateData.product_thumb ||
      updateData.product_description ||
      updateData.product_price !== undefined ||
      updateData.product_quantity !== undefined
    )
  }

  private extractBasicFields(updateData: updateProductBodyZodType) {
    const basicFields: any = {}
    if (updateData.product_name) basicFields.product_name = updateData.product_name
    if (updateData.product_thumb) basicFields.product_thumb = updateData.product_thumb
    if (updateData.product_description) basicFields.product_description = updateData.product_description
    if (updateData.product_price !== undefined) basicFields.product_price = updateData.product_price
    if (updateData.product_quantity !== undefined) basicFields.product_quantity = updateData.product_quantity
    return basicFields
  }

  private generateUpdateMessage(hasBasicUpdate: boolean, hasAttributeUpdate: boolean): string {
    if (hasBasicUpdate && hasAttributeUpdate) {
      return 'Product information and attributes updated successfully'
    } else if (hasBasicUpdate) {
      return 'Product information updated successfully'
    } else if (hasAttributeUpdate) {
      return 'Product attributes updated successfully'
    } else {
      return 'No changes made'
    }
  }

  private async createProductSequential(productData: CreateProductType, shopId: string) {
    let createdProduct
    let createdAttributes
    try {
      // Step 1: Create base product first
      const baseProductData = ProductFactory.createBaseProduct(productData, shopId)
      createdProduct = await this.productRepository.createProduct(baseProductData)

      // Step 2: Create specific attributes
      const attributeData = AttributeFactory.createAttributes(productData, createdProduct._id.toString())
      createdAttributes = await this.productRepository.createProductAttributes(productData.product_type, attributeData)

      // Step 3: Update product with attributes_id
      await this.productRepository.updateProductAttributesId(
        createdProduct._id.toString(),
        createdAttributes._id.toString()
      )

      return {
        product: {
          ...createdProduct.toObject(),
          attributes_id: createdAttributes._id
        },
        attributes: createdAttributes
      }
    } catch (error) {
      // Cleanup: Delete created documents nếu có lỗi
      if (createdAttributes) {
        try {
          await this.productRepository.deleteProductAttributes(
            productData.product_type,
            createdAttributes._id.toString()
          )
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

  async getAllDraftsForShop(userId: string) {
    try {
      const result = this.productRepository.getAllDraftsForShop(userId)
      return result
    } catch (error) {
      throw new BadRequestError('Get all Draft is failed')
    }
  }

  async getAllPublishedForShop(userId: string) {
    try {
      const result = this.productRepository.getAllPublishedForShop(userId)
      return result
    } catch (error) {
      throw new BadRequestError('Get all Draft is failed')
    }
  }

  async publishProductByShop(productId: string, userId: string) {
    try {
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new UnauthorizedError('shop not found')
      }
      const result = await this.productRepository.updatePublishProductByShop(
        productId,
        convertObjectIdToString(shop._id)
      )
      return result
    } catch (error) {
      throw new BadRequestError('Published product is failed')
    }
  }

  async updateUnPublishedProductForShop(productId: string, userId: string) {
    try {
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new UnauthorizedError('shop not found')
      }
      const result = await this.productRepository.updateUnPublishedProductForShop(
        productId,
        convertObjectIdToString(shop._id)
      )
      return result
    } catch (error) {
      throw new BadRequestError('Published product is failed')
    }
  }

  async searchProducts(searchParams: { query: string; category?: string; page: number; limit: number }) {
    try {
      const result = await this.productRepository.searchProducts(searchParams)
      return result
    } catch (error) {
      throw new BadRequestError('Search failed')
    }
  }

  async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    try {
      return await this.productRepository.findAllProducts({
        limit,
        sort,
        page,
        filter,
        select: ['product_name', 'product_price', 'product_thumb']
      })
    } catch (error) {
      throw new BadRequestError('Find all products failed')
    }
  }

  async findProduct(productId: string) {
    try {
      return await this.productRepository.findProduct({ productId, unSelect: ['__v', 'product_variations'] })
    } catch (error) {
      throw new BadRequestError('Find product failed')
    }
  }

  updateProduct = async (productId: string, updateData: updateProductBodyZodType, userId: string) => {
    try {
      const shop = await this.shopRepository.findShopByUserId(userId)
      if (!shop) {
        throw new UnauthorizedError('Shop not found. Only shop owners can update products')
      }
      const { product, currentAttributes } = await this.productRepository.getProductForUpdate(
        productId,
        convertObjectIdToString(shop._id)
      )
      if ('product_type' in updateData) {
        throw new BadRequestError('Cannot change product_type. Create a new product instead.')
      }

      const hasBasicUpdate = this.hasBasicFieldUpdate(updateData)
      const hasAttributeUpdate = updateData.product_attributes && Object.keys(updateData.product_attributes).length > 0

      let updatedProduct = product
      let updatedAttributes = currentAttributes

      if (hasBasicUpdate && !hasAttributeUpdate) {
        const basicFields = this.extractBasicFields(updateData)
        updatedProduct = await this.productRepository.updateProductBasic(productId, basicFields)
      } else if (!hasBasicUpdate && hasAttributeUpdate) {

        if (product.attributes_id && currentAttributes) {
          // Update existing attributes
          updatedAttributes = await this.productRepository.updateProductAttributes(
            product.product_type,
            product.attributes_id.toString(),
            updateData.product_attributes!,
            currentAttributes
          )
        } else {
          // Create new attributes if not exists
          updatedAttributes = await this.productRepository.createProductAttributesIfNotExists(
            productId,
            product.product_type,
            updateData.product_attributes!
          )
        }
      } else if (hasBasicUpdate && hasAttributeUpdate) {
        console.log('🔄 Strategy: Update Both Product & Attributes')

        // Update basic fields first
        const basicFields = this.extractBasicFields(updateData)
        updatedProduct = await this.productRepository.updateProductBasic(productId, basicFields)

        // Then update attributes
        if (product.attributes_id && currentAttributes) {
          updatedAttributes = await this.productRepository.updateProductAttributes(
            product.product_type,
            product.attributes_id.toString(),
            updateData.product_attributes!,
            currentAttributes
          )
        } else {
          updatedAttributes = await this.productRepository.createProductAttributesIfNotExists(
            productId,
            product.product_type,
            updateData.product_attributes!
          )
        }
      }
      else {
        throw new BadRequestError('No valid fields to update after cleaning null/undefined values')
      }
      return {
        product: updatedProduct,
        attributes: updatedAttributes,
        updateSummary: {
          productUpdated: hasBasicUpdate,
          attributesUpdated: hasAttributeUpdate,
          fieldsUpdated: {
            product: hasBasicUpdate ? Object.keys(this.extractBasicFields(updateData)) : [],
            attributes: hasAttributeUpdate ? Object.keys(updateData.product_attributes!) : []
          }
        }
      }
    } catch (error) {
      throw new BadRequestError('Update product failed')
    }
  }
}
