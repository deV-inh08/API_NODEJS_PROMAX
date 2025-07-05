// jest.config.js (Main configuration - chạy cả unit và integration)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  forceExit: true,

  // TypeScript configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // File extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Test tất cả các file test
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],

  // Module name mapping
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/index.{ts,js}'
  ],

  // Display
  verbose: true,
  displayName: 'All Tests',

  // Projects - Chạy cả unit và integration
  projects: [
    '<rootDir>/jest.unit.config.js',
    '<rootDir>/jest.integration.config.js'
  ],

  // Global settings
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: {
        module: 'commonjs'
      }
    }
  }
}