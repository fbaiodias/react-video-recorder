import { defineConfig } from 'vitest/config'
import jsxInJs from './test/jsx-in-js.mjs'

export default defineConfig({
  plugins: [jsxInJs()],
  test: {
    // Known bug pinned by test/unit/lifecycle.test.js: unmounting during the
    // countdown still runs startRecording(), which throws in a promise nobody
    // handles. Drop this once that's fixed.
    onUnhandledError (error) {
      if (String(error?.message).includes("reading 'videoWidth'")) return false
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['test/unit/**/*.test.js'],
          setupFiles: ['test/unit/setup.js']
        }
      },
      {
        extends: true,
        test: {
          name: 'package',
          environment: 'node',
          include: ['test/package/**/*.test.js'],
          testTimeout: 60000
        }
      }
    ]
  }
})
