import { ProductRepository } from '~/api/v1/repositories/product.repository'
import { IClothing, IElectronics, IFurniture, IProduct, IProductVariation } from '~/api/v1/types/product.type'
import { BadRequestError, ValidationError } from '~/api/v1/utils/response.util'

class ProductFactory {
  static async creatProduct(productData: IProduct) {
    const { product_type } = productData

    switch (product_type) {
      case 'Electronics':
        return // Tao Electronic
      case 'Clothing':
        return await this.createClothingProduct(productData)
      case 'Furniture':
        return // Tao Furniture
      default:
        throw new BadRequestError(`Unsupported product type ${product_type}`)
    }
  }

  private static createElectronicProduct() { }

  private static async createClothingProduct(baseProduct: IProduct) {
    const { product_attributes } = baseProduct
    await this.validateAttributeClothingProduct(product_attributes as IClothing)
    return baseProduct
  }

  private static createFurnitureProduct() { }

  private static async validateAttributeClothingProduct(attributes: IClothing) {
    if (!attributes.size || attributes.size.length === 0) {
      throw new ValidationError('At least one size is required for clothing')
    }

    // không có chất liệu
    if (!attributes.material) {
      throw new ValidationError('Material is required for clothing')
    }
  }
  private static async validateAttributeElectronicProduct(attributes: IElectronics) {
    if (!attributes.brand) throw new ValidationError('Brand is required for electronics')
    if (!attributes.model) throw new ValidationError('Model is required for electronics')
    if (!attributes.warranty) throw new ValidationError('Warranty is required for electronics')
    // Validate warranty format (e.g., "12 months", "2 years")
    const warrantyRegex = /^(\d+)\s+(month|months|year|years)$/i
    if (!warrantyRegex.test(attributes.warranty)) {
      throw new ValidationError('Invalid warranty format. Use "12 months" or "2 years"')
    }
  }
  private static async validateAttributeFurnitureProduct(attributes: IFurniture) {
    if (!attributes.dimensions) {
      throw new ValidationError('Dimensions are required for furniture')
    }
    const { height, length, width, weight } = attributes.dimensions
    if (!length || !width || !height || !weight) {
      throw new ValidationError('Complete dimensions (L×W×H, weight) required for furniture')
    }
    // Validate reasonable dimensions (not too big/small)
    if (length > 500 || width > 500 || height > 500) {
      throw new ValidationError('Furniture dimensions seem too large (max 500cm)')
    }
  }
}

export class ProductServices {
  private productFactory: ProductFactory
  private productRepository: ProductRepository

  constructor() {
    this.productFactory = new ProductFactory()
    this.productRepository = new ProductRepository()
  }
}
