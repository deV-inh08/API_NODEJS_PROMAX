import { Schema } from 'mongoose'
import { IClothing, IElectronics, IFurniture, IProduct } from '~/api/v1/types/product.type'

export const productSchema = new Schema<IProduct>(
  {
    product_name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Productname cannot exeed 200 characters'],
      index: 'text'
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
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Product shop is required'],
      index: true
    },
    attributes_id: { type: Schema.Types.ObjectId, required: false, default: null },
    product_ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      set: (value: number) => Math.round(value * 10) / 10 // Round to 1 decimal
    },
    product_ratingsCount: {
      type: Number,
      default: 0,
      min: [0, 'Ratings count cannot be negative']
    },
    product_variations: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        options: [
          {
            type: String,
            required: true,
            trim: true
          }
        ]
      }
    ],
    product_slug: {
      type: String,
      unique: true,
      index: true
    },

    // Status fields for better product management
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false // When we query (document.findOne) => attribute 'select' display none if value is 'false'
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    collection: 'Product',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

export const furnitureSchema = new Schema<IFurniture>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    brand: { type: String, required: true },
    material: { type: String, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      weight: { type: Number, required: true }
    }
  },
  {
    collection: 'Furniture',
    timestamps: true
  }
)

export const clothingSchema = new Schema<IClothing>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: [String],
      required: true
    },
    material: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: [String],
      required: true,
      trim: true
    },
    style: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    collection: 'Clothing',
    timestamps: true
  }
)

export const electronicSchema = new Schema<IElectronics>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    warranty: {
      type: String,
      required: true,
      trim: true
    },
    specifications: {
      type: Map,
      of: String, // key is String
      required: true,
      trim: true,
      default: {}
    }
  },
  {
    collection: 'Electronic',
    timestamps: true
  }
)
