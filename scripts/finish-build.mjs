// Runs after tsc has emitted lib/ (CommonJS) and lib/esm/ (ES modules).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Node and bundlers treat .js files under lib/esm/ as ES modules.
writeFileSync('lib/esm/package.json', JSON.stringify({ type: 'module' }) + '\n')

// tsc rewrites `./x.tsx` imports to `./x.js` in JavaScript but not in
// declarations, and TypeScript before 5.0 can't resolve .ts/.tsx there.
for (const entry of readdirSync('lib', { recursive: true })) {
  if (!entry.endsWith('.d.ts')) continue
  const path = join('lib', entry)
  const source = readFileSync(path, 'utf8')
  writeFileSync(
    path,
    source.replace(/(from '\.{1,2}\/[^']+)\.tsx?'/g, "$1.js'")
  )
}

// The stylesheet the components inject, for apps that load it themselves.
const { STYLES } = await import('../lib/esm/styles.js')
writeFileSync('lib/styles.css', STYLES.trimStart())
