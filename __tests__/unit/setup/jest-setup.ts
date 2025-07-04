import MemoryDatabaseHelper from './mongodb-helper'

// Force test environment
process.env.NODE_ENV = 'test'

const memoryDB = MemoryDatabaseHelper.getInstance()

// run once before all tests
beforeAll(async () => {
  const uri = await memoryDB.connect()
  console.log('URI Memory', uri)
  // Safety check
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('❌ CRITICAL: Not in test environment!')
  }

  // Verify we're using memory storage
  const info = memoryDB.getConnectionInfo()
  console.log('📊 Database Info:', info)

  if (!info.isMemoryServer) {
    throw new Error('❌ CRITICAL: Not using Memory Server!')
  }
}, 30000)

// Global cleanup - runs once after all tests
afterAll(async () => {
  console.log('\n🧹 Cleaning up Unit Tests Environment...')
  await memoryDB.disconnect()
}, 30000)

// Clean database before each test for isolation
beforeEach(async () => {
  await memoryDB.clearDatabase()
}, 15000)
