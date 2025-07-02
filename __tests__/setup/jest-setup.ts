import MongoDbTest from "../setup/mongodb-helper";

const testDB = MongoDbTest.getInstance()

// run once before all tests
beforeAll(async () => {
  await testDB.connect()
  await testDB.createIndexes()
})

// run once after all tests
afterAll(async () => {
  await testDB.clearDatabase()
})

// Clear database before each test
beforeEach(async () => {
  await testDB.clearDatabase()
})
