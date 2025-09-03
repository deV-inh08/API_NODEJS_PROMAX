import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

class MemoryDatabaseHelper {
  private static instance: MemoryDatabaseHelper
  private MongoServer: MongoMemoryServer | null = null
  private isConnected: boolean = false

  static getInstance(): MemoryDatabaseHelper {
    if (!MemoryDatabaseHelper.instance) {
      MemoryDatabaseHelper.instance = new MemoryDatabaseHelper()
    }
    return MemoryDatabaseHelper.instance
  }

  async connect(): Promise<string> {
    // nếu connect rồi
    if (this.isConnected) {
      return this.MongoServer!.getUri()
    }

    try {
      // start MongoDb Memory Server
      this.MongoServer = await MongoMemoryServer.create({
        binary: {
          version: '6.0.4', // Compatible với OpenSSL 3.0
          downloadDir: './mongodb-binaries'
        }
      })
      const uri = this.MongoServer.getUri()
      console.log(uri)

      // connect
      await mongoose.connect(uri)

      this.isConnected = true

      return uri
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

    } catch (error) {
      console.log('error', error)
    }
  }

  async clearDatabase() {
    if (!this.isConnected) {
      return
    }

    try {
      // clear all collections
      const collections = mongoose.connection.collections
      for (const key in collections) {
        await collections[key].deleteMany({})
      }
    } catch (error) {
      console.error('❌ Failed to clear test database:', error)
      throw error
    }
  }

  getConnectionInfo() {
    return {
      isMemoryServer: true,
      uri: this.MongoServer?.getUri(),
      isConnected: this.isConnected,
      storageEngine: 'memory'
    }
  }
}
export default MemoryDatabaseHelper
