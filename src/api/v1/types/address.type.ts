import { AddressType } from '~/api/v1/types/comon.types'

export interface IAddress {
  type: AddressType // nhà | cơ quan
  phoneNumber: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string // thành phố
  state: string // tỉnh
  country: string
  isDefault: boolean
}

// User create new Address
export interface ICreateAddress {
  type: AddressType
  phoneNumber: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  country: string
  isDefault?: boolean
}

export interface IUpdateAddress extends Partial<ICreateAddress> {
  id: string
}
