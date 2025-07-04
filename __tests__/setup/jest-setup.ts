import MongoDbTest from "../setup/mongodb-helper";

process.env.NODE_ENV = 'test'

const testDB = MongoDbTest.getInstance()

// run once before all tests
beforeAll(async () => {
  await testDB.connect()
  await testDB.createIndexes()
})

// run once after all tests
afterAll(async () => {
  // clear Db
  await testDB.clearDatabase()

  // disconnect test DB
  await testDB.disconnect()
})

// Clear database before each test
beforeEach(async () => {
  await testDB.clearDatabase()
})
