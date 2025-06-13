import mongoose from "mongoose";
import envConfig from "~/config/env.config";
import { countConnect } from "~/api/v1/helpers/checkConnect.helper";

class Database {
  private static instance: Database
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    if (1 == 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', {
        color: true
      })
    }
    mongoose.connect(envConfig.DB_URI).then(_ => console.log('Connected MongoDb Success', countConnect())).catch(err => console.log('Error connect'));
  }

  // instance with SingleTon pattern
  static getInstace(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongoDb = Database.getInstace()

export default instanceMongoDb