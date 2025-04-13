export default {
  // Enable ESM support in Jest
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  transform: {
    // Transform TypeScript files with ts-jest
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    // Handle ESM imports
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  injectGlobals: true, // Enable Jest globals
}; 