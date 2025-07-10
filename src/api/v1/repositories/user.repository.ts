import { registerZodType } from '~/api/v1/validations/auth.validation'
import { userSchema } from '~/api/v1/models/users.model'
import { IUser } from '~/api/v1/types/user.type'
import { Model } from 'mongoose'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { ClientSession } from 'mongoose'

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

  // check user is exist => register /login flow
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

  // get user by ID -> User Status Validation (Don't need password)
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

  // re-verify password user đã login
  async getUserByIdWithPassword(userId: string): Promise<IUser | null> {
    const UserModel = await this.getUserModel()
    return await UserModel.findOne({
      _id: userId
    }).lean()
  }

  async updatePassword(
    userId: string,
    updateData: {
      password: string
      passwordChangeAt: Date
    }
  ) {
    const UserModel = await this.getUserModel()
    return await UserModel.updateOne({ _id: userId }, updateData)
  }

  // Update password when forgot password success
  async updatePasswordResetOTP(
    userId: string,
    data: {
      passwordResetOTP: string
      passwordResetOTPExpires: Date
      passwordResetAttempts: number
      passwordResetLastAttempt: Date
      isOTPVerified: boolean
    }
  ) {
    const UserModel = await this.getUserModel()
    return await UserModel.updateOne(
      {
        _id: userId
      },
      data
    )
  }

  // clear old password when forgot password success
  async clearPasswordResetPassword(userId: string) {
    const UserModel = await this.getUserModel()
    return await UserModel.updateOne(
      // unset: xóa field
      { _id: userId },
      {
        $unset: {
          passwordResetOTP: 1,
          passwordResetOTPExpires: 1,
          passwordResetToken: 1,
          passwordResetAttempts: 1,
          passwordResetLastAttempt: 1,
          accountLockUntil: 1,
          isOTPVerified: 1
        }
      }
    )
  }

  // If User enter failed OTP -> Increment failed attempts
  async incrementPasswordResetAttempt(userId: string) {
    const UserModel = await this.getUserModel()
    return await UserModel.updateOne(
      {
        _id: userId
      },
      {
        $inc: {
          passwordResetAttempts: 1 // incre 1
        }
      }
    )
  }

  // lock Account
  async lockAccount(userId: string, lockUntil: Date) {
    const UserModel = await this.getUserModel()
    return UserModel.updateOne(
      {
        _id: userId
      },
      {
        accountLockUntils: lockUntil
      }
    )
  }

  // set isOTPVerify is true
  async verifyOTP(userId: string) {
    const UserModel = await this.getUserModel()
    return UserModel.updateOne(
      {
        _id: userId
      },
      {
        isOTPVerified: true
      }
    )
  }
}
