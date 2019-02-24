const { join } = require('path')

const isDebug = !!process.env.DEBUG
const isCI = !!process.env.CI

module.exports = {
  launch: {
    headless: !isDebug,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${join(
        __dirname,
        'test/assets/bowing.y4m'
      )}`
    ]
  },
  server: isCI
    ? {
      command: 'yarn start',
      port: 3001,
      launchTimeout: 120000
    }
    : null
}
