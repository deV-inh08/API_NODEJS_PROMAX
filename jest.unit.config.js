module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  // Setup file for Memory Server
  setupFilesAfterEnv: ['<rootDir>/__tests__/unit/setup/jest-unit-setup.ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Display settings
  verbose: true,
  displayName: 'Unit Tests'
}
