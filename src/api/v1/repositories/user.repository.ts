import { registerZodType } from '~/api/v1/validations/auth.validation'
import { userSchema } from '~/api/v1/models/users.model'
import { IUser } from '~/api/v1/types/user.type'
import { Model } from 'mongoose'
import dbManager from '~/api/v1/db/dbName.mongo'

export class UserRepository {
  private models = new Map<string, Model<IUser>>()
  private dbName: 'ecommerce' = 'ecommerce' as const

  // Dynamic model per DB
  private async getUserModel(dbName: 'ecommerce' | 'testing') {
    if (!this.models.has(dbName)) {
      const connection = await dbManager.getConnection(dbName)
      const userModel = connection.model<IUser>('User', userSchema)
      this.models.set(dbName, userModel)
    }
    return this.models.get(dbName)!
  }

  // check user is exist
  async checkUserIsExists(email: string): Promise<IUser | null> {
    const UserModel = await this.getUserModel(this.dbName)
    return await UserModel.findOne({
      email
    })
  }

  // register new user
  async registerUser(userData: registerZodType) {
    const UserModel = await this.getUserModel(this.dbName)
    const user = new UserModel(userData)
    return await user.save()
  }

  // get user by ID -> User Status Validation
  async getUserById(userId: string): Promise<IUser | null> {
    const UserModel = await this.getUserModel(this.dbName)
    return await UserModel.findOne(
      {
        _id: userId
      },
      {
        // Exclude sensitive fields for security
        password: 0,
        emailVerificationToken: 0,
        passwordResetToken: 0
      }
    ).lean()
  }
}
