import brcypt from 'bcrypt'

export class BcryptServices {
  private static readonly SALT_ROUNDS = 12

  // hass password
  static async hashPassword(password: string): Promise<string> {
    return await brcypt.hash(password, this.SALT_ROUNDS)
  }

  // compare password
  static async comparePassword(password: string, hashPassword: string): Promise<boolean> {
    return await brcypt.compare(password, hashPassword)
  }
}
