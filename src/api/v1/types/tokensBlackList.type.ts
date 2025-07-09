export interface IBlackListsType extends Document {
  token: string
  userId: string
  blacklistedAt: Date
  expiresAt: Date
}