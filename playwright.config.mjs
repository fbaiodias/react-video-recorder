import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const fakeVideo = fileURLToPath(
  new URL('./test/assets/bowing.y4m', import.meta.url)
)

const chromium = {
  ...devices['Desktop Chrome'],
  permissions: ['camera', 'microphone'],
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${fakeVideo}`,
      '--autoplay-policy=no-user-gesture-required'
    ]
  }
}

const firefox = {
  ...devices['Desktop Firefox'],
  launchOptions: {
    firefoxUserPrefs: {
      'media.navigator.streams.fake': true,
      'media.navigator.permission.disabled': true,
      'media.autoplay.default': 0
    }
  }
}

export default defineConfig({
  testDir: './test/e2e',
  // Parallel browsers fight over the fake camera and slow each other down
  // enough to break the timing assertions.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:5179',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'vite --config test/e2e/vite.config.mjs',
    url: 'http://localhost:5179',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'chromium', use: chromium, testIgnore: /visual\.spec\.js/ },
    { name: 'firefox', use: firefox, testIgnore: /visual\.spec\.js/ },
    // Screenshots of every state, to compare the UI before and after the
    // styling rewrite. Baselines are per-OS, so this runs locally, not in CI.
    { name: 'visual', use: chromium, testMatch: /visual\.spec\.js/ }
  ]
})
