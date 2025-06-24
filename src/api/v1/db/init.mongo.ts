import mongoose from 'mongoose'
import envConfig from '~/api/v1/config/env.config'
import dbManager from '~/api/v1/db/dbName.mongo'

class Database {
  private static instance: Database
  private isConnected: boolean = false
  constructor() {
    this.connect()
  }

  // connect
  async connect(type = 'mongodb') {
    if (!this.isConnected) {
      try {
        await dbManager.getConnection(envConfig.DB_NAME as 'ecommerce')
        // await mongoose.connect(envConfig.DB_URI, {
        //   maxPoolSize: 50
        // })
        this.isConnected = true
      } catch (error) {
        console.log('Error connect', error)
      }
    } else {
      console.log('Database was connected')
    }
  }

  // instance with SingleTon pattern
  static getInstace(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  // disconnect
  disconnect() {
    if (this.isConnected) {
      mongoose.disconnect().then((_) => console.log('Disconnected MongoDb'))
      this.isConnected = false
    }
  }

  // health check
  async healthCheck() {
    try {
      await mongoose.connection.db?.admin().ping()
      return {
        status: 'healthy',
        connected: this.isConnected,
        readyState: mongoose.connection.readyState
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error
      }
    }
  }
}

export default Database
