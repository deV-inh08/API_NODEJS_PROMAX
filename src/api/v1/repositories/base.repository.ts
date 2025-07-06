import mongoose from 'mongoose'
import envConfig from '~/api/v1/config/env.config'
import dbManager from '~/api/v1/db/dbName.mongo'

export abstract class BaseRepository {
  // Dynamic dbName based
  protected get dbName(): 'ecommerce' | 'testing' | 'memory' {
    const env = process.env.NODE_ENV
    const testType = process.env.TEST_TYPE

    if (env === 'test') {
      if (testType === 'integration') {
        return 'testing' //  DB (testing)
      } else {
        return 'memory' // test RAM
      }
    } else {
      return 'ecommerce' // DB (production)
    }
  }

  // Smart connect strategy
  protected async getConnection() {
    const dbName = this.dbName

    // For integration tests, use the existing mongoose connection
    if (dbName === 'testing' && process.env.NODE_ENV === 'test') {
      return mongoose.connection
    }

    if (dbName === 'memory') {
      return mongoose.connection
    } else {
      // Use dbManager for persistent databases (production)
      return await dbManager.getConnection(dbName)
    }
  }
}
