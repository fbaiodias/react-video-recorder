import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import jsxInJs from '../jsx-in-js.mjs'

export default defineConfig({
  root: fileURLToPath(new URL('./harness', import.meta.url)),
  plugins: [jsxInJs()],
  // The dependency scan doesn't go through plugins, so it needs its own hint
  // that .js files contain JSX.
  optimizeDeps: {
    rolldownOptions: { moduleTypes: { '.js': 'jsx' } }
  },
  server: {
    port: 5179,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] }
  }
})
