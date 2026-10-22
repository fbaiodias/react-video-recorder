import { transformWithOxc } from 'vite'

// Tests and the e2e harness keep JSX in .js files, which Vite doesn't parse
// by default.
export default function jsxInJs() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (id.includes('/node_modules/') || !/\/(src|test)\/.+\.js$/.test(id)) {
        return null
      }
      const result = await transformWithOxc(code, id, {
        lang: 'jsx',
        jsx: { runtime: 'automatic' }
      })
      return { code: result.code, map: result.map }
    }
  }
}
