module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest',
    "^.+\\.js?$": "babel-jest"
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^canvas/(.*)$': '<rootDir>/src/canvas/$1',
    '^dojo/(.*)$': '<rootDir>/src/dojo/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^common/(.*)$': '<rootDir>/src/common/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/'
}
