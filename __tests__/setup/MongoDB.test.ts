import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import dbManager from '../../src/api/v1/db/dbName.mongo'

class MongoDbTest {
  private static instance: MongoDbTest
  private MongoServer: MongoMemoryServer | null = null
  private isConnected: boolean = false

  static getInstance(): MongoDbTest {
    if (!MongoDbTest.instance) {
      MongoDbTest.instance = new MongoDbTest()
    }
    return MongoDbTest.instance
  }

  async connect(): Promise<void> {
    // nếu connect rồi
    if (this.isConnected) {
      return
    }

    try {
      // start MongoDb Memory Server
      this.MongoServer = await MongoMemoryServer.create({
        binary: {
          version: '6.0.0'
        }
      })
      const uri = this.MongoServer.getUri()

      // Override using existing dbManager
      process.env.DB_URI = uri.replace('/test', '')
      process.env.DB_NAME = 'testing'

      await dbManager.getConnection('testing')
      this.isConnected = true
    } catch (error) {
      console.error('❌ Test database connection failed:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.MongoServer) {
      return
    }
    try {
      // close all mongoose connect
      await mongoose.disconnect()

      // Stop MongoDb Memory Server
      await this.MongoServer.stop()

      this.isConnected = false
      this.MongoServer = null

      console.log('Test database disconnect')
    } catch (error) {
      console.log('error', error)
    }
  }

  async clearDatabase() {
    if (!this.isConnected) {
      return
    }

    try {
      const connection = await dbManager.getConnection('testing')
      const collections = await connection.db?.collections()

      // clear all collections
      if (!collections) {
        console.log('Not found collections')
      } else {
        for (const collection of collections) {
          await collection.deleteMany({})
        }
      }
    } catch (error) {
      console.error('❌ Failed to clear test database:', error)
      throw error
    }
  }

  async createIndexes(): Promise<void> {
    // Create necessary indexes for testing
    try {
      const connection = await dbManager.getConnection('testing')

      // User collection indexes
      const userCollection = connection.collection('users')
      await userCollection.createIndex({ email: 1 }, { unique: true })

      // RefreshToken collection indexes  
      const tokenCollection = connection.collection('refreshtokens')
      await tokenCollection.createIndex({ token: 1 }, { unique: true })
      await tokenCollection.createIndex({ userId: 1 })
      await tokenCollection.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })

      console.log('📊 Test database indexes created')
    } catch (error) {
      console.error('❌ Failed to create test indexes:', error)
      // Don't throw - indexes might already exist
    }
  }
}
export default MongoDbTest
