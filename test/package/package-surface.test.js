import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// What a consumer gets from the published package: the files, and what every
// public path resolves to through `require` (lib/) and `import` (lib/esm/).
// Apps deep-import lib/defaults/* (e.g. to reuse the default buttons in a
// custom renderActions), so those 3.x paths are public API too.

const root = fileURLToPath(new URL('../..', import.meta.url))

const PUBLIC_MODULES = [
  '',
  '/lib',
  '/lib/index',
  '/lib/video-recorder',
  '/lib/custom-errors',
  '/lib/get-video-info',
  '/lib/defaults/button',
  '/lib/defaults/countdown',
  '/lib/defaults/disconnected-view',
  '/lib/defaults/error-view',
  '/lib/defaults/loading-view',
  '/lib/defaults/record-button',
  '/lib/defaults/render-actions',
  '/lib/defaults/stop-button',
  '/lib/defaults/switch-camera-view',
  '/lib/defaults/timer',
  '/lib/defaults/unsupported-view',
  // With the extension, as some apps import them.
  '/lib/defaults/timer.js'
]

const describeExports = (mod) =>
  Object.keys(mod)
    .sort()
    .map((key) => `${key}: ${typeof mod[key]}`)

let consumerDir
let requireFromConsumer

beforeAll(() => {
  execFileSync('pnpm', ['--silent', 'run', 'build'], {
    cwd: root,
    stdio: 'pipe'
  })

  // Resolve the package by name, as an app with it in node_modules would.
  consumerDir = mkdtempSync(join(tmpdir(), 'rvr-consumer-'))
  mkdirSync(join(consumerDir, 'node_modules'))
  symlinkSync(
    root,
    join(consumerDir, 'node_modules', 'react-video-recorder'),
    'dir'
  )
  requireFromConsumer = createRequire(join(consumerDir, 'index.js'))
})

afterAll(() => {
  if (consumerDir) rmSync(consumerDir, { recursive: true, force: true })
})

// Imports each path in a separate Node process, so it goes through Node's
// own ES module resolution and the package's "exports" conditions.
function importFromConsumer(subpaths) {
  const script = join(consumerDir, 'import.mjs')
  writeFileSync(
    script,
    `const result = {}
for (const subpath of ${JSON.stringify(subpaths)}) {
  const mod = await import('react-video-recorder' + subpath)
  result[subpath] = Object.keys(mod).sort().map((key) => key + ': ' + typeof mod[key])
}
console.log(JSON.stringify(result))`
  )
  return JSON.parse(
    execFileSync('node', [script], { cwd: consumerDir, encoding: 'utf8' })
  )
}

describe('published package', () => {
  it('contains these files', () => {
    const [pack] = JSON.parse(
      execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      })
    )
    const files = pack.files.map((file) => file.path).sort()
    // lib/esm/ mirrors lib/.
    const esm = files.filter((file) => file.startsWith('lib/esm/'))
    expect(esm).toEqual(
      files
        .filter((file) => /^lib\/(?!esm\/).*\.(js|d\.ts)$/.test(file))
        .map((file) => file.replace('lib/', 'lib/esm/'))
        .concat('lib/esm/package.json')
        .sort()
    )
    expect(files.filter((file) => !file.startsWith('lib/esm/'))).toEqual([
      'LICENSE.md',
      'README.md',
      'lib/custom-errors.d.ts',
      'lib/custom-errors.js',
      'lib/defaults/button.d.ts',
      'lib/defaults/button.js',
      'lib/defaults/countdown.d.ts',
      'lib/defaults/countdown.js',
      'lib/defaults/disconnected-view.d.ts',
      'lib/defaults/disconnected-view.js',
      'lib/defaults/error-view.d.ts',
      'lib/defaults/error-view.js',
      'lib/defaults/loading-view.d.ts',
      'lib/defaults/loading-view.js',
      'lib/defaults/record-button.d.ts',
      'lib/defaults/record-button.js',
      'lib/defaults/render-actions.d.ts',
      'lib/defaults/render-actions.js',
      'lib/defaults/stop-button.d.ts',
      'lib/defaults/stop-button.js',
      'lib/defaults/switch-camera-view.d.ts',
      'lib/defaults/switch-camera-view.js',
      'lib/defaults/timer.d.ts',
      'lib/defaults/timer.js',
      'lib/defaults/unsupported-view.d.ts',
      'lib/defaults/unsupported-view.js',
      'lib/get-video-info.d.ts',
      'lib/get-video-info.js',
      'lib/index.d.ts',
      'lib/index.js',
      'lib/styles.css',
      'lib/styles.d.ts',
      'lib/styles.js',
      'lib/types.d.ts',
      'lib/types.js',
      'lib/use-video-recorder.d.ts',
      'lib/use-video-recorder.js',
      'lib/video-recorder.d.ts',
      'lib/video-recorder.js',
      'package.json'
    ])
  })

  it.each(PUBLIC_MODULES)(
    'require("react-video-recorder%s") gets CommonJS with ES module interop',
    (subpath) => {
      const resolved = requireFromConsumer.resolve(
        `react-video-recorder${subpath}`
      )
      expect(resolved).not.toContain('/lib/esm/')
      const mod = requireFromConsumer(`react-video-recorder${subpath}`)
      expect(mod.__esModule).toBe(true)
    }
  )

  it('exports these from require()', () => {
    const shapes = Object.fromEntries(
      PUBLIC_MODULES.map((subpath) => [
        subpath || '.',
        describeExports(requireFromConsumer(`react-video-recorder${subpath}`))
      ])
    )
    expect(shapes).toMatchInlineSnapshot(`
      {
        ".": [
          "ReactVideoRecorder: object",
          "ReactVideoRecorderDataAvailableTimeoutError: function",
          "ReactVideoRecorderDataIssueError: function",
          "ReactVideoRecorderDeviceUnavailableError: function",
          "ReactVideoRecorderMediaRecorderUnavailableError: function",
          "ReactVideoRecorderRecordedBlobsUnavailableError: function",
          "VideoRecorder: object",
          "default: object",
          "useVideoRecorder: function",
        ],
        "/lib": [
          "ReactVideoRecorder: object",
          "ReactVideoRecorderDataAvailableTimeoutError: function",
          "ReactVideoRecorderDataIssueError: function",
          "ReactVideoRecorderDeviceUnavailableError: function",
          "ReactVideoRecorderMediaRecorderUnavailableError: function",
          "ReactVideoRecorderRecordedBlobsUnavailableError: function",
          "VideoRecorder: object",
          "default: object",
          "useVideoRecorder: function",
        ],
        "/lib/custom-errors": [
          "ReactVideoRecorderDataAvailableTimeoutError: function",
          "ReactVideoRecorderDataIssueError: function",
          "ReactVideoRecorderDeviceUnavailableError: function",
          "ReactVideoRecorderMediaRecorderUnavailableError: function",
          "ReactVideoRecorderRecordedBlobsUnavailableError: function",
        ],
        "/lib/defaults/button": [
          "default: object",
        ],
        "/lib/defaults/countdown": [
          "default: function",
        ],
        "/lib/defaults/disconnected-view": [
          "default: function",
        ],
        "/lib/defaults/error-view": [
          "default: function",
        ],
        "/lib/defaults/loading-view": [
          "default: function",
        ],
        "/lib/defaults/record-button": [
          "default: function",
        ],
        "/lib/defaults/render-actions": [
          "default: function",
        ],
        "/lib/defaults/stop-button": [
          "default: function",
        ],
        "/lib/defaults/switch-camera-view": [
          "default: function",
        ],
        "/lib/defaults/timer": [
          "default: function",
        ],
        "/lib/defaults/timer.js": [
          "default: function",
        ],
        "/lib/defaults/unsupported-view": [
          "default: function",
        ],
        "/lib/get-video-info": [
          "captureThumb: function",
          "default: function",
        ],
        "/lib/index": [
          "ReactVideoRecorder: object",
          "ReactVideoRecorderDataAvailableTimeoutError: function",
          "ReactVideoRecorderDataIssueError: function",
          "ReactVideoRecorderDeviceUnavailableError: function",
          "ReactVideoRecorderMediaRecorderUnavailableError: function",
          "ReactVideoRecorderRecordedBlobsUnavailableError: function",
          "VideoRecorder: object",
          "default: object",
          "useVideoRecorder: function",
        ],
        "/lib/video-recorder": [
          "default: object",
        ],
      }
    `)
  })

  it('exports the same from import()', () => {
    const fromRequire = Object.fromEntries(
      PUBLIC_MODULES.map((subpath) => [
        subpath,
        describeExports(
          requireFromConsumer(`react-video-recorder${subpath}`)
        ).filter((entry) => !entry.startsWith('__esModule'))
      ])
    )
    expect(importFromConsumer(PUBLIC_MODULES)).toEqual(fromRequire)
  })

  it('exports the hooks component from the main entry', () => {
    const main = requireFromConsumer('react-video-recorder')
    const direct = requireFromConsumer(
      'react-video-recorder/lib/video-recorder'
    )
    expect(main.default).toBe(direct.default)
    expect(main.VideoRecorder).toBe(main.default)
    expect(main.ReactVideoRecorder).toBe(main.default)
    expect(main.default.$$typeof).toBe(Symbol.for('react.forward_ref'))
  })

  it('resolves the stylesheet', () => {
    const path = requireFromConsumer.resolve('react-video-recorder/styles.css')
    expect(readFileSync(path, 'utf8')).toMatch(/^\.rvr-wrapper \{/)
  })

  it('ships declarations next to every module', () => {
    for (const subpath of PUBLIC_MODULES.filter((path) =>
      path.startsWith('/lib/')
    )) {
      const js = requireFromConsumer.resolve(`react-video-recorder${subpath}`)
      expect(readFileSync(js.replace(/\.js$/, '.d.ts'), 'utf8')).not.toBe('')
    }
  })

  it("marks the modules that use React hooks with 'use client'", () => {
    const lib = join(root, 'lib')
    const directive = /^(?:"use strict";\s*)?'use client';/
    const marked = readdirSync(lib, { recursive: true })
      .filter((file) => file.endsWith('.js'))
      .filter((file) => directive.test(readFileSync(join(lib, file), 'utf8')))
      .map((file) => file.replace(/^esm\//, ''))
    // So frameworks like Next.js can render the components from server
    // components; the index, errors and types stay usable on the server.
    expect([...new Set(marked)].sort()).toEqual([
      'defaults/button.js',
      'defaults/countdown.js',
      'defaults/disconnected-view.js',
      'defaults/error-view.js',
      'defaults/loading-view.js',
      'defaults/record-button.js',
      'defaults/render-actions.js',
      'defaults/stop-button.js',
      'defaults/switch-camera-view.js',
      'defaults/timer.js',
      'defaults/unsupported-view.js',
      'styles.js',
      'use-video-recorder.js',
      'video-recorder.js'
    ])
    expect(marked).toHaveLength(28)
  })

  it('ships ES2019 syntax, without ?. or ??, for older bundlers', () => {
    const lib = join(root, 'lib')
    const withModernSyntax = readdirSync(lib, { recursive: true })
      .filter((file) => file.endsWith('.js'))
      .filter((file) =>
        /\?\.[\w([]|\?\?/.test(readFileSync(join(lib, file), 'utf8'))
      )
    expect(withModernSyntax).toEqual([])
  })
})
