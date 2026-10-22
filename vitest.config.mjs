import { defineConfig } from 'vitest/config'
import jsxInJs from './test/jsx-in-js.mjs'

export default defineConfig({
  plugins: [jsxInJs()],
  test: {
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
