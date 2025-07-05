import { registerZodType } from '~/api/v1/validations/auth.validation'
import { userSchema } from '~/api/v1/models/users.model'
import { IUser } from '~/api/v1/types/user.type'
import { Model } from 'mongoose'
import dbManager from '~/api/v1/db/dbName.mongo'
import { BaseRepository } from '~/api/v1/repositories/base.repository'

export class UserRepository extends BaseRepository {
  private models = new Map<string, Model<IUser>>()

  // Dynamic model per DB
  private async getUserModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const userModel = connection.model<IUser>('User', userSchema)
      this.models.set(dbName, userModel)
    }
    return this.models.get(dbName)!
  }

  // check user is exist
  async checkUserIsExists(email: string): Promise<IUser | null> {
    const UserModel = await this.getUserModel()
    return await UserModel.findOne({
      email
    })
  }

  // register new user
  async registerUser(userData: registerZodType) {
    const UserModel = await this.getUserModel()
    const user = new UserModel(userData)
    return await user.save()
  }

  // get user by ID -> User Status Validation
  async getUserById(userId: string): Promise<IUser | null> {
    const UserModel = await this.getUserModel()
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
