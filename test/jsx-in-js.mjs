import { transformWithOxc } from 'vite'

// The source keeps JSX in .js files (like the Babel build expects), which Vite
// doesn't parse by default. Compile those with the classic runtime, matching
// what @babel/preset-react produces for lib/.
export default function jsxInJs () {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform (code, id) {
      if (id.includes('/node_modules/') || !/\/(src|test)\/.+\.js$/.test(id)) {
        return null
      }
      const result = await transformWithOxc(code, id, {
        lang: 'jsx',
        jsx: { runtime: 'classic' }
      })
      return { code: result.code, map: result.map }
    }
  }
}
