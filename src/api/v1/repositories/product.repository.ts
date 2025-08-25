import { FlattenMaps, Model, Types } from 'mongoose'
import { productSchema } from '~/api/v1/models/product.model'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IClothing, IElectronics, IFurniture, IProduct } from '~/api/v1/types/product.type'
import {
  FurnitureAttributes,
  ClothingAttributes,
  ElectronicsAttributes,
  updateProductBodyZodType
} from '~/api/v1/validations/product.validation'
import { BaseProductType } from '~/api/v1/validations/product.validation'
import { electronicSchema, clothingSchema, furnitureSchema } from '~/api/v1/models/product.model'
import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { convertStringToObjectId, getSelectData, unGetSelectData } from '~/api/v1/utils/common.util'

export class ProductRepository extends BaseRepository {
  private models = {
    product: new Map<string, Model<IProduct>>(),
    electronics: new Map<string, Model<IElectronics>>(),
    clothing: new Map<string, Model<IClothing>>(),
    furniture: new Map<string, Model<IFurniture>>()
  }

  private async getProductModel(): Promise<Model<IProduct>> {
    const dbName = this.dbName
    if (!this.models.product.has(dbName)) {
      const connection = await this.getConnection()
      const productModel = connection.model<IProduct>('Product', productSchema)
      this.models.product.set(dbName, productModel)
    }
    return this.models.product.get(dbName)!
  }
  // 🎯 ELECTRONICS MODEL
  private async getElectronicsModel(): Promise<Model<IElectronics>> {
    const dbName = this.dbName
    if (!this.models.electronics.has(dbName)) {
      const connection = await this.getConnection()
      const model = connection.model<IElectronics>('Electronics', electronicSchema)
      this.models.electronics.set(dbName, model)
    }
    return this.models.electronics.get(dbName)!
  }

  // 🎯 CLOTHING MODEL
  private async getClothingModel(): Promise<Model<IClothing>> {
    const dbName = this.dbName
    if (!this.models.clothing.has(dbName)) {
      const connection = await this.getConnection()
      const model = connection.model<IClothing>('Clothing', clothingSchema)
      this.models.clothing.set(dbName, model)
    }
    return this.models.clothing.get(dbName)!
  }

  // 🎯 FURNITURE MODEL
  private async getFurnitureModel(): Promise<Model<IFurniture>> {
    const dbName = this.dbName
    if (!this.models.furniture.has(dbName)) {
      const connection = await this.getConnection()
      const model = connection.model<IFurniture>('Furniture', furnitureSchema)
      this.models.furniture.set(dbName, model)
    }
    return this.models.furniture.get(dbName)!
  }

  // 🏭 DYNAMIC ATTRIBUTE MODEL GETTER
  private async getAttributeModel(productType: string): Promise<Model<IElectronics | IClothing | IFurniture>> {
    switch (productType) {
      case 'Electronics':
        return (await this.getElectronicsModel()) as Model<IElectronics | IClothing | IFurniture>
      case 'Clothing':
        return (await this.getClothingModel()) as Model<IElectronics | IClothing | IFurniture>
      case 'Furniture':
        return (await this.getFurnitureModel()) as Model<IElectronics | IClothing | IFurniture>
      default:
        throw new BadRequestError(`Unsupported product type: ${productType}`)
    }
  }

  // create Product
  async createProduct(productData: BaseProductType) {
    const ProductModel = await this.getProductModel()
    const product = new ProductModel(productData)
    return await product.save()
  }

  async createProductAttributes(
    productType: string,
    attributeData: ClothingAttributes | ElectronicsAttributes | FurnitureAttributes
  ): Promise<IElectronics | IClothing | IFurniture> {
    try {
      const AttributeModel = await this.getAttributeModel(productType)
      const attributes = new AttributeModel(attributeData)
      const savedAttributes = await attributes.save()
      return savedAttributes
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message)
        throw new BadRequestError(`Validation failed: ${validationErrors.join(', ')}`)
      }
      throw new BadRequestError(`Failed to create ${productType} attributes: ${error.message}`)
    }
  }

  async updateProductAttributesId(productId: string, attributesId: string): Promise<void> {
    try {
      const ProductModel = await this.getProductModel()
      const result = await ProductModel.updateOne(
        { _id: convertStringToObjectId(productId) },
        {
          attributes_id: convertStringToObjectId(attributesId),
          updatedAt: new Date()
        }
      )

      if (result.matchedCount === 0) {
        throw new NotFoundError('Product not found for attributes linking')
      }

      if (result.modifiedCount === 0) {
        throw new BadRequestError('Failed to link product with attributes')
      }
    } catch (error: any) {
      console.error('❌ Error linking product with attributes:', error)
      throw error
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const ProductModel = await this.getProductModel()
      const result = await ProductModel.deleteOne({
        _id: convertStringToObjectId(productId)
      })

      if (result.deletedCount === 0) {
        console.warn(`⚠️ Product ${productId} not found for deletion`)
      } else {
        console.log(`🗑️ Product ${productId} deleted successfully`)
      }
    } catch (error: any) {
      throw new BadRequestError(`Failed to delete product: ${error.message}`)
    }
  }

  async deleteProductAttributes(productType: string, attributesId: string): Promise<number> {
    try {
      const AttributeModel = await this.getAttributeModel(productType)
      const result = await AttributeModel.deleteOne({
        _id: convertStringToObjectId(attributesId)
      })

      if (result.deletedCount === 0) {
        throw new NotFoundError(`${productType} attributes ${attributesId} not found for deletion`)
      }
      return result.deletedCount
    } catch (error) {
      throw new BadRequestError(`Failed to delete attributes`)
    }
  }

  async checkProductByIds(productIds: string[]): Promise<FlattenMaps<IProduct>[]> {
    const ProductModel = await this.getProductModel()
    return await ProductModel.find({
      _id: {
        $in: productIds
      }
    }).lean()
  }

  async getAllDraftsForShop(userId: string) {
    const options = { limit: 50, skip: 0 }
    const ProductModel = await this.getProductModel()

    const [products, totalCount] = await Promise.all([
      ProductModel.aggregate([
        {
          $lookup: {
            from: 'shops', // ← TÌM TRONG shops collection
            localField: 'shop_id', // Field trong products
            foreignField: '_id', // ← MATCH với field _id trong shops
            as: 'shop_infor' // ← LƯU KẾT QUẢ VÀO shop_info
          }
        },
        {
          $match: {
            'shop_infor.user_id': convertStringToObjectId(userId),
            'shop_infor.status': 'active',
            isDraft: true
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: options.skip
        },
        { $limit: options.limit },
        {
          $project: {
            // ✅ Product fields cần thiết
            _id: 1,
            product_name: 1,
            product_thumb: 1,
            product_description: 1,
            product_price: 1,
            product_quantity: 1,
            product_type: 1,
            product_slug: 1,
            isPublished: 1,
            isDraft: 1,
            createdAt: 1,
            updatedAt: 1,

            // ✅ Shop fields CẦN THIẾT THÔI
            'shop_info._id': 1,
            'shop_info.shop_name': 1,
            'shop_info.shop_slug': 1
          }
        }
      ]),
      this.countShopDraftProducts(userId)
    ])

    return {
      products,
      pagination: {
        skip: options.skip,
        limit: options.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / options.limit)
      }
    }
  }

  async getAllPublishedForShop(userId: string) {
    const options = { limit: 50, skip: 0 }
    const ProductModel = await this.getProductModel()

    const [products, totalCount] = await Promise.all([
      ProductModel.aggregate([
        {
          $lookup: {
            from: 'shops', // ← TÌM TRONG shops collection
            localField: 'shop_id', // Field trong products
            foreignField: '_id', // ← MATCH với field _id trong shops
            as: 'shop_infor' // ← LƯU KẾT QUẢ VÀO shop_info
          }
        },
        {
          $match: {
            'shop_infor.user_id': convertStringToObjectId(userId),
            'shop_infor.status': 'active',
            isPublished: true
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: options.skip
        },
        { $limit: options.limit },
        {
          $project: {
            // ✅ Product fields cần thiết
            _id: 1,
            product_name: 1,
            product_thumb: 1,
            product_description: 1,
            product_price: 1,
            product_quantity: 1,
            product_type: 1,
            product_slug: 1,
            isPublished: 1,
            isDraft: 1,
            createdAt: 1,
            updatedAt: 1,

            // ✅ Shop fields CẦN THIẾT THÔI
            'shop_info._id': 1,
            'shop_info.shop_name': 1,
            'shop_info.shop_slug': 1
          }
        }
      ]),
      this.countShopPublishedProducts(userId)
    ])

    return {
      products,
      pagination: {
        skip: options.skip,
        limit: options.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / options.limit)
      }
    }
  }

  async countShopDraftProducts(userId: string): Promise<number> {
    const ProductModel = await this.getProductModel()

    const result = await ProductModel.aggregate([
      {
        $lookup: {
          from: 'shops',
          localField: 'shop_id',
          foreignField: '_id',
          as: 'shop_infor'
        }
      },
      {
        $match: {
          'shop_infor.user_id': convertStringToObjectId(userId),
          'shop_infor.status': 'active',
          isDraft: true
        }
      },
      {
        $count: 'total'
      }
    ])
    return result[0]?.total || 0
  }

  async countShopPublishedProducts(userId: string): Promise<number> {
    const ProductModel = await this.getProductModel()

    const result = await ProductModel.aggregate([
      {
        $lookup: {
          from: 'shops',
          localField: 'shop_id',
          foreignField: '_id',
          as: 'shop_infor'
        }
      },
      {
        $match: {
          'shop_infor.user_id': convertStringToObjectId(userId),
          'shop_infor.status': 'active',
          isPublished: true
        }
      },
      {
        $count: 'total'
      }
    ])
    return result[0]?.total || 0
  }

  async updatePublishProductByShop(productId: string, shop_id: string) {
    const ProductModel = await this.getProductModel()
    const result = await ProductModel.updateOne(
      {
        _id: convertStringToObjectId(productId),
        shop_id: shop_id,
        isDraft: true
      },
      {
        isDraft: false,
        isPublished: true,
        updatedAt: new Date()
      }
    )

    // 0: don't update | 1: updated
    if (!result.modifiedCount) {
      throw new NotFoundError('Product not found or already published')
    }

    return {
      result: result.matchedCount
    }
  }

  async updateUnPublishedProductForShop(productId: string, shop_id: string) {
    const ProductModel = await this.getProductModel()
    const result = await ProductModel.updateOne(
      {
        _id: convertStringToObjectId(productId),
        shop_id: shop_id,
        isPublished: true
      },
      {
        isDraft: true,
        isPublished: false,
        updatedAt: new Date()
      }
    )

    // 0: don't update | 1: updated
    if (!result.modifiedCount) {
      throw new NotFoundError('Product not found or already published')
    }

    return {
      result: result.matchedCount
    }
  }

  async searchProducts(params: { query: string; category?: string; page: number; limit: number }) {
    const ProductModel = await this.getProductModel()
    const products = await ProductModel.find(
      {
        isPublished: true,
        isDraft: false,
        $text: {
          $search: params.query,
          $caseSensitive: false
        }
      },
      {
        score: { $meta: 'textScore' }
      }
    )
      .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
      .lean()
    return {
      products,
      searchQuery: params.query,
      pagination: {
        page: params.page,
        limit: params.limit
      }
    }
  }

  async findAllProducts({
    limit,
    sort,
    page,
    filter,
    select
  }: {
    limit: number
    sort: string
    page: number
    filter: {
      isPublished: boolean
      shop_id?: Types.ObjectId
      _id?: {
        $in: Types.ObjectId[]
      }
    }
    select: string[]
  }) {
    const ProductModel = await this.getProductModel()
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await ProductModel.find(filter)
      .sort(sortBy as { _id: 1 | -1 })
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean()
    return products
  }

  async findProduct({ productId, unSelect }: { productId: string; unSelect: string[] }) {
    const ProductModel = await this.getProductModel()
    const product = await ProductModel.findById(productId).select(unGetSelectData(unSelect)).lean()
    return product
  }

  async getProductForUpdate(productId: string, shopId: string) {
    const ProductModel = await this.getProductModel()
    const product = await ProductModel.findOne({
      _id: convertStringToObjectId(productId),
      shop_id: convertStringToObjectId(shopId)
    }).lean()

    if (!product) {
      throw new NotFoundError('Product not found or you do not have permission')
    }

    let currentAttributes = null
    if (product.attributes_id && product.product_type) {
      const AttributeModel = await this.getAttributeModel(product.product_type)
      currentAttributes = await AttributeModel.findById(product.attributes_id).lean()
    }

    return {
      product,
      currentAttributes
    }
  }

  async updateProductBasic(productId: string, updateData: Partial<updateProductBodyZodType>) {
    const ProductModel = await this.getProductModel()
    const result = await ProductModel.findByIdAndUpdate(
      convertStringToObjectId(productId),
      {
        ...updateData,
        updatedAt: new Date()
      },
      {
        new: true, // Return updated document
        lean: true // Return plain object
      }
    )
    if (!result) {
      throw new NotFoundError('Product not found')
    }

    return result
  }

  async updateProductAttributes(
    productType: string,
    attributesId: string,
    newAttributes: Record<string, any>,
    currentAttributes: any = null
  ) {
    try {
      const AttributeModel = await this.getAttributeModel(productType)
      // Validate attributes
      const mergedAttributes = {
        ...currentAttributes, // Keep existing data
        ...newAttributes // Override with new data
      }
      const result = await AttributeModel.findByIdAndUpdate(
        convertStringToObjectId(attributesId),
        {
          ...mergedAttributes,
          updatedAt: new Date()
        },
        {
          new: true,
          lean: true
        }
      )
      if (!result) {
        throw new NotFoundError(`${productType} attributes not found`)
      }
      return result
    } catch (error) {
      throw new BadRequestError(`Invalid ${productType} attributes: ${error}`)
    }
  }

  async createProductAttributesIfNotExists(productId: string, productType: string, attributeData: Record<string, any>) {
    try {
      // Create new attributes
      const AttributeModel = await this.getAttributeModel(productType)
      const newAttributes = new AttributeModel({
        product_id: convertStringToObjectId(productId),
        ...attributeData
      })

      const savedAttributes = await newAttributes.save()

      // Update product với attributes_id mới
      await this.updateProductAttributesId(productId, savedAttributes._id.toString())

      return savedAttributes
    } catch (error: any) {
      throw new BadRequestError(`Failed to create ${productType} attributes: ${error.message}`)
    }
  }
}
