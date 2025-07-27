import { Schema } from 'mongoose'
import { IInventory } from '~/api/v1/types/inventory.type'

export const InventotySchema = new Schema<IInventory>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'shops',
      required: true
    },
    inven_stock: {
      type: Number,
      required: [true, 'Stock is required']
    },
    inven_reservations: {
      type: [String],
      default: [],
      validate: (reservations: string[]) => Array.isArray(reservations)
    }
  },
  {
    collection: 'Inventory',
    timestamps: true
  }
)

InventotySchema.index(
  {
    product_id: 1,
    shop_id: 1
  },
  {
    unique: true
  }
)
