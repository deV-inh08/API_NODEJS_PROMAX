import mongoose from "mongoose";
import envConfig from "~/api/v1/config/env.config";

class Database {
  private static instance: Database
  private isConnected: boolean = false
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    if (!this.isConnected) {
      mongoose.connect(envConfig.DB_URI, {
        maxPoolSize: 50
      }).then(_ => {
        this.isConnected = true
        console.log('Connected MongoDb Success')
      }).catch(err => console.log('Error connect'));
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
      mongoose.disconnect().then(_ => console.log('Disconnected MongoDb'))
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
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error
      };
    }
  }
}

export default Database