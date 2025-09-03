module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,

  // TypeScript configuration
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // File extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Setup file for Memory Server
  setupFilesAfterEnv: ['<rootDir>/__tests__/unit/setup/jest-unit-setup.ts'],

  // Module name mapping
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },

  // Chỉ test unit tests
  testMatch: ['**/__tests__/unit/**/*.test.ts'],

  // Ignore integration tests
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '__tests__/integration/'],

  // Coverage cho unit tests
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/**/*.test.{ts,js}', '!src/**/index.{ts,js}'],

  // Display settings
  verbose: true,
  displayName: 'Unit Tests',

  // Global settings for unit tests
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        module: 'commonjs'
      }
    }
  }
}
