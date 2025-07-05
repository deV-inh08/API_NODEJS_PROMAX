// __tests__/integration/setup/jest-integration-setup.ts
import mongoose from 'mongoose'
import envConfig from '~/api/v1/config/env.config'

// Force test environment
process.env.NODE_ENV = 'test'
process.env.TEST_TYPE = 'integration'

// Database connection
let connection: mongoose.Connection

beforeAll(async () => {
  // Safety check
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('❌ CRITICAL: Not in test environment!')
  }

  // Connect to real test database
  const testDbUri = `${envConfig.DB_URI}/${envConfig.DB_NAME}?${envConfig.DB_OPTION}`

  try {
    await mongoose.connect(testDbUri)
    connection = mongoose.connection

    console.log('🔗 Connected to test database for integration tests')
    console.log('📊 Database Info:', {
      name: connection.db?.databaseName,
      host: connection.host,
      port: connection.port,
      readyState: connection.readyState
    })
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error)
    throw error
  }
}, 60000)

// Global cleanup - runs once after all tests
afterAll(async () => {
  console.log('\n🧹 Cleaning up Integration Tests Environment...')

  try {
    // Drop test database to ensure clean state
    if (connection && connection.db) {
      await connection.db.dropDatabase()
      console.log('🗑️ Test database dropped')
    }

    // Close connection
    await mongoose.disconnect()
    console.log('🔌 Database disconnected')
  } catch (error) {
    console.error('❌ Cleanup error:', error)
  }
}, 30000)

// Clean database before each test for isolation
beforeEach(async () => {
  if (connection && connection.db) {
    const collections = await connection.db.collections()

    for (const collection of collections) {
      await collection.deleteMany({})
    }
  }
}, 15000)