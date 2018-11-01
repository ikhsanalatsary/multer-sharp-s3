module.exports = function() {
  return {
    files: ['tsconfig.json', 'src/**/*.ts'],

    tests: ['__tests__/*.ts'],

    env: {
      type: 'node',
      runner: 'node',
    },

    testFramework: 'jest',
  }
}
