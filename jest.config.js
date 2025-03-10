module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lucide-react$': '<rootDir>/src/components/ui/__mocks__/lucide-react.tsx',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      configFile: './babel.config.test.js'  // Use a dedicated Babel config for tests
    }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Mock the utils directory for component tests to avoid ESM issues
  moduleDirectories: ['node_modules', '<rootDir>'],
}; 