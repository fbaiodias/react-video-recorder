module.exports = {
  extends: ['standard', 'standard-react', 'plugin:jest/recommended'],
  parser: 'babel-eslint',
  settings: {
    react: {
      version: '16.8'
    }
  },
  env: {
    browser: true
  },
  plugins: ['jest']
}
