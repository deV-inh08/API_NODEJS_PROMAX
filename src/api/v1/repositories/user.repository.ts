import User from "~/api/v1/models/users.model";
import { registerZodType } from "~/api/v1/validations/auth.validation";

export class UserRepository {

  async registerUser(user: registerZodType) {
    const userModel = new User(user)
    return await userModel.save()
  }
}