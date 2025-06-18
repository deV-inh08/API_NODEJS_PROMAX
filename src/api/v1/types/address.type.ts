import { AddressType } from "~/api/v1/types/comon.types";

export interface IAddress {
  type: AddressType
  phoneNumber: string
  addressline1: string
  addressline2?: string
  city: string
  country: string
  postalCode: string
  isDefault: boolean
}