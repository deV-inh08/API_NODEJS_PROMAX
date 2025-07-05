// jest.integration.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  displayName: 'Integration Tests',
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup/jest-integration-setup.ts'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  }
}