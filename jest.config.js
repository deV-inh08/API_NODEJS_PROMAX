// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapping: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: ['src/api/**/*.ts', '!src/api/**/*.d.ts', '!src/__tests__/**', '!src/**/*.type.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/testSetup.ts'],
  testTimeout: 30000,
  verbose: true
}
