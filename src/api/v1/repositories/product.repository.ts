import { Model } from 'mongoose'
import { productSchema } from '~/api/v1/models/product.model'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IProduct } from '~/api/v1/types/product.type'

export class ProductRepository extends BaseRepository {
  private models = new Map<string, Model<IProduct>>()

  private async getProductModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const productModel = connection.model<IProduct>('Product', productSchema)
      this.models.set(dbName, productModel)
    }
    return this.models.get(dbName)!
  }

  // create Product
  async createProduct(productData: IProduct) {
    const ProductModel = await this.getProductModel()!
    const product = new ProductModel(productData)
    return await product.save()
  }
}
