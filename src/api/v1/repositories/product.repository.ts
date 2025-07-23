import { Model } from 'mongoose'
import { productSchema } from '~/api/v1/models/product.model'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IClothing, IElectronics, IFurniture, IProduct } from '~/api/v1/types/product.type'
import { CreateProductType } from '~/api/v1/validations/product.validation'
import { electronicSchema, clothingSchema, furnitureSchema } from '~/api/v1/models/product.model'
import { BadRequestError, NotFoundError } from '~/api/v1/utils/response.util'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'

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
  private async getAttributeModel(productType: string): Promise<Model<any>> {
    switch (productType) {
      case 'Electronics':
        return await this.getElectronicsModel()
      case 'Clothing':
        return await this.getClothingModel()
      case 'Furniture':
        return await this.getFurnitureModel()
      default:
        throw new BadRequestError(`Unsupported product type: ${productType}`)
    }
  }

  // create Product
  async createProduct(productData: Omit<CreateProductType, 'product_attributes'>) {
    const ProductModel = await this.getProductModel()
    const product = new ProductModel(productData)
    return await product.save()
  }

  async createProductAttributes(
    productType: string,
    attributeData: any
  ): Promise<IElectronics | IClothing | IFurniture> {
    try {
      const AttributeModel = await this.getAttributeModel(productType)
      const attributes = new AttributeModel(attributeData)
      const savedAttributes = await attributes.save()

      console.log(`✅ ${productType} attributes created: ${savedAttributes._id}`)
      return savedAttributes
    } catch (error: any) {
      console.error(`❌ Error creating ${productType} attributes:`, error)

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

      console.log(`✅ Product ${productId} linked with attributes ${attributesId}`)
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
      console.error(`❌ Error deleting product ${productId}:`, error)
      throw new BadRequestError(`Failed to delete product: ${error.message}`)
    }
  }

  async deleteProductAttributes(productType: string, attributesId: string): Promise<void> {
    try {
      const AttributeModel = await this.getAttributeModel(productType)
      const result = await AttributeModel.deleteOne({
        _id: convertStringToObjectId(attributesId)
      })

      if (result.deletedCount === 0) {
        console.warn(`⚠️ ${productType} attributes ${attributesId} not found for deletion`)
      } else {
        console.log(`🗑️ ${productType} attributes ${attributesId} deleted successfully`)
      }
    } catch (error: any) {
      console.error(`❌ Error deleting ${productType} attributes ${attributesId}:`, error)
      throw new BadRequestError(`Failed to delete attributes: ${error.message}`)
    }
  }
}
