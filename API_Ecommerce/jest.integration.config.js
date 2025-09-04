module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 120000, // Longer timeout for integration tests
  forceExit: true,

  // TypeScript configuration
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // File extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Setup file for real database
  setupFilesAfterEnv: ['<rootDir>/__tests__/integration/setup/jest-integration-setup.ts'],

  // Module name mapping
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },

  // Chỉ test integration tests
  testMatch: ['**/__tests__/integration/**/*.test.ts'],

  // Ignore unit tests
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '__tests__/unit/'],

  // Coverage cho integration tests
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/**/*.test.{ts,js}', '!src/**/index.{ts,js}'],

  // Display settings
  verbose: true,
  displayName: 'Integration Tests',

  // Global settings for integration tests
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        module: 'commonjs'
      }
    }
  }
}
