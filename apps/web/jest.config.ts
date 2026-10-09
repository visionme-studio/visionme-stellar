import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJdest();

const config: Config = async () => ({
  ...(await createJdestConfig({
    dirName: __dirname,
  })),
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^/(*)$': ['<rootDir>/$1'],
  },
  testPathignorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
});

export default config;
