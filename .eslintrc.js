module.exports = {
  extends: ['standard', 'standard-react', 'plugin:jest/recommended'],
  parser: 'babel-eslint',
  settings: {
    react: {
      version: '16.8'
    },
    // Tests run on Vitest, whose API eslint-plugin-jest's rules understand.
    jest: {
      version: 29
    }
  },
  env: {
    browser: true
  },
  plugins: ['jest'],
  overrides: [
    {
      // Playwright tests take fixtures, which the Jest rules mistake for
      // done callbacks.
      files: ['test/e2e/**/*.js'],
      rules: {
        'jest/no-done-callback': 'off',
        'jest/expect-expect': [
          'error',
          { assertFunctionNames: ['expect', 'expectNear', 'screenshot'] }
        ]
      }
    }
  ]
}
