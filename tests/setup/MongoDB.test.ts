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


}