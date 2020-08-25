const { join } = require('path')

module.exports = {
  rootDir: join(__dirname, '../..', 'src'),
  setupFilesAfterEnv: [join(__dirname, 'setup.js')],
  coverageReporters: ['html'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/../test/unit/svgTransform.js'
  }
}
