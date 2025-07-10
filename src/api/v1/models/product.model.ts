import { Schema } from "mongoose";
import { IProduct } from "~/api/v1/types/product.type";

export const productSchema = new Schema<IProduct>({
  product_name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Productname cannot exeed 200 characters'],
    index: 'text' // for search
  },

  product_thumb: {
    type: String,
    required: [true, 'Product thumbnail is required'],
    validate: {
      validator: (v: string) => {
        return /^https?:\/\/.+\.(jpg|jpeg|png)$/i.test(v)
      },
      message: ' Product thumbnail must be a valid image URL'
    }
  },
  product_description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  product_price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: (v: number) => Math.round(v * 100) / 100 // Round to 2 decimal places
  },
  product_quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  product_type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Furniture'],
      message: 'Product type must be Electronics, Clothing, or Furniture'
    },
    index: true
  },
  product_shop: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Product shop is required'],
    index: true
  },
  product_attributes: {
    type: Schema.Types.Mixed,
    required: [true, 'Product attributes are required']
  },
  product_ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    set: (v: number) => Math.round(v * 10) / 10 // Round to 1 decimal
  },
  product_ratingsCount: {
    type: Number,
    default: 0,
    min: [0, 'Ratings count cannot be negative']
  },
  product_variations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      type: String,
      required: true,
      trim: true
    }]
  }],
  product_slug: {
    type: String,
    unique: true,
    index: true
  },
  // Status fields for better product management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  collection: 'Products',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})