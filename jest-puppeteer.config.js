const { join } = require('path')

const isDebug = !!process.env.DEBUG

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
  }
}
