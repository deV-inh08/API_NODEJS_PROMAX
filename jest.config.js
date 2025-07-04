
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.test.ts']
};