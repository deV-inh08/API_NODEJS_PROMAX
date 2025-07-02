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
  collectCoverageFrom: [
    'src/api/**/*.ts',
    '!src/api/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/*.type.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/testSetup.ts'],

  // Fix memory leaks and timeouts
  testTimeout: 30000,
  verbose: false,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,

  // Ignore deprecated warnings
  silent: false,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Performance optimization
  cacheDirectory: '<rootDir>/.jest-cache',

  // Handle async operations properly
  globalSetup: undefined,
  globalTeardown: undefined
}