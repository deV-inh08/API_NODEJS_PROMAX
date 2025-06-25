import mongoose from "mongoose"
import envConfig from "~/api/v1/config/env.config"

class DatabaseManager {
  private static instance: DatabaseManager
  private connections = new Map()

  private databaseConfig = {
    ecommerce: {
      uri: `${envConfig.DB_URI}`,
      options: {
        maxPoolSize: 10
      }
    },
    testing: {
      uri: `${envConfig.DB_URI}`,
      options: {
        maxPoolSize: 10
      }
    }
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async getConnection(dbName: keyof typeof this.databaseConfig): Promise<mongoose.Connection> {
    if (this.connections.has(dbName)) {
      const existingConnection = this.connections.get(dbName)! // '!' filter undefined
      if (existingConnection.readyState === 1) {
        return existingConnection
      }
    }

    // if is not existing
    const config = this.databaseConfig[dbName]
    if (!config) {
      throw new Error(`Database configuration for '${dbName}' not found`)
    }
    try {
      const connection = mongoose.createConnection(`${config.uri}/${dbName}?${envConfig.DB_OPTION}`, config.options)
      console.log('Connected MongoDb Success')

      this.connections.set(dbName, connection)
      return connection
    } catch (error) {
      console.error(`❌ Failed to connect to ${dbName}:`, error)
      throw error
    }
  }
}

const dbManager = DatabaseManager.getInstance()
export default dbManager
