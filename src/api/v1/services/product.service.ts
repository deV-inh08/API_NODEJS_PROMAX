import { Types } from 'mongoose'
import { productSchema, clothingSchema, electronicSchema } from '~/api/v1/models/product.model'
import { IProduct, IProductVariation } from '~/api/v1/types/product.type'


class ProductFactory {
  static async creatProduct() {

  }
}


// define base product
class Product implements IProduct {
  product_name: string
  product_thumb: string
  product_description: string
  product_price: number
  product_quantity: number
  product_type: 'Electronics' | 'Clothing' | 'Furniture' // more ....
  product_shop: Types.ObjectId // trỏ tới id của shop nào có product này
  product_attributes: any
  product_ratingsAverage?: number // 4.7/5 star
  product_ratingsCount?: number // Số lượng đánh giá: 120 reviews
  product_variations?: IProductVariation[]
  product_slug: string
  isActive: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
    product_ratingsAverage,
    product_ratingsCount,
    product_variations,
    product_slug,
    isActive,
    isPublished,
    createdAt,
    updatedAt,
  }: IProduct) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_ratingsAverage = product_ratingsAverage;
    this.product_ratingsCount = product_ratingsCount;
    this.product_variations = product_variations;
    this.product_slug = product_slug;
    this.isActive = isActive ?? true; // default true
    this.isPublished = isPublished ?? false; // default false
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }



}