import { registerZodType } from "~/api/v1/validations/auth.validation";
import User from "~/api/v1/models/users.model";

export class UserRepository {
  async registerUser(user: registerZodType) {
    const userModel = new User(user)
    return await userModel.save()
  }
}
