const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js 앱의 경로
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jest-environment-jsdom',

  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 모듈 경로 별칭
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,ts}',
    '!src/app/layout.tsx',
  ],

  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 변환 무시 패턴
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // 테스트 타임아웃
  testTimeout: 10000,

  // 상세 출력
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
