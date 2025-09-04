export interface IOrder {
  order_userId: string
  order_checkout: object
  order_shipping: object
  order_payment: object
  order_products: []
  order_trackingNumber: number
  order_status: string
}
