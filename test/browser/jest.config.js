const { join } = require('path')

module.exports = {
  rootDir: join(__dirname, '../..', 'src'),
  testRegex: '(/__tests__/.*|(\\.|/)browser-test)\\.js$',
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: [join(__dirname, 'setup.js')]
}
