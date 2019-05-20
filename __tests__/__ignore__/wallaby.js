module.exports = function() {
  return {
    files: [
      'tsconfig.json',
      'src/**/*.ts',
      '__tests__/*.txt',
      '__tests__/**/*.js',
      '__tests__/*.png',
    ],

    tests: ['__tests__/*.spec.ts'],

    env: {
      type: 'node',
      runner: 'node',
    },

    testFramework: 'jest',

    delays: {
      run: 5000,
    },
  }
}
