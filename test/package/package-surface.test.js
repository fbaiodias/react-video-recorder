import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// What a consumer gets from the published package: the file list, the
// CommonJS shape of each module, and the syntax level. Apps deep-import
// lib/defaults/* (e.g. to reuse the default buttons in a custom
// renderActions), so those paths are public API too.

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
  '/lib/defaults/unsupported-view'
]

let consumerDir
let requireFromConsumer

beforeAll(() => {
  execFileSync('yarn', ['--silent', 'build'], { cwd: root, stdio: 'pipe' })

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

describe('published package', () => {
  it('contains these files', () => {
    const [pack] = JSON.parse(
      execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      })
    )
    expect(pack.files.map((file) => file.path).sort()).toEqual([
      'LICENSE.md',
      'README.md',
      'lib/custom-errors.js',
      'lib/defaults/button.js',
      'lib/defaults/countdown.js',
      'lib/defaults/disconnected-view.js',
      'lib/defaults/error-view.js',
      'lib/defaults/loading-view.js',
      'lib/defaults/record-button.js',
      'lib/defaults/render-actions.js',
      'lib/defaults/stop-button.js',
      'lib/defaults/switch-camera-view.js',
      'lib/defaults/timer.js',
      'lib/defaults/unsupported-view.js',
      'lib/get-video-info.js',
      'lib/index.js',
      'lib/video-recorder.js',
      // [known bug] babel --copy-files copies the files --ignore skips, so the
      // story ships as raw JSX. (3.19.4 also shipped the old test files.)
      'lib/video-recorder.stories.js',
      'package.json'
    ])
  })

  it.each(PUBLIC_MODULES)(
    'react-video-recorder%s is CommonJS with a default export',
    (subpath) => {
      const mod = requireFromConsumer(`react-video-recorder${subpath}`)
      if (subpath === '/lib/custom-errors') {
        expect(mod.__esModule).toBe(true)
        return
      }
      expect(mod.__esModule).toBe(true)
      expect(mod.default).toBeDefined()
    }
  )

  it('exports the component from the main entry', () => {
    const main = requireFromConsumer('react-video-recorder')
    const direct = requireFromConsumer(
      'react-video-recorder/lib/video-recorder'
    )
    expect(main.default).toBe(direct.default)
    expect(Object.keys(main)).toEqual(['default'])
    expect(typeof main.default).toBe('function')
    expect(main.default.prototype.isReactComponent).toBeTruthy()
  })

  it('exports these named modules', () => {
    const shapes = Object.fromEntries(
      PUBLIC_MODULES.filter((subpath) => subpath.startsWith('/lib/')).map(
        (subpath) => {
          const mod = requireFromConsumer(`react-video-recorder${subpath}`)
          return [
            subpath,
            Object.keys(mod)
              .sort()
              .map((key) => `${key}: ${typeof mod[key]}`)
          ]
        }
      )
    )
    expect(shapes).toMatchInlineSnapshot(`
      {
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
        "/lib/defaults/unsupported-view": [
          "default: function",
        ],
        "/lib/get-video-info": [
          "captureThumb: function",
          "default: function",
        ],
        "/lib/index": [
          "default: function",
        ],
        "/lib/video-recorder": [
          "default: function",
        ],
      }
    `)
  })

  it('ships ES5 syntax', () => {
    const modernSyntax = /=>|\bclass\s|\bconst\s|\blet\s|\?\?|\?\./
    const modulesWithModernSyntax = PUBLIC_MODULES.filter((subpath) =>
      subpath.startsWith('/lib/')
    ).filter((subpath) =>
      modernSyntax.test(
        readFileSync(
          requireFromConsumer.resolve(`react-video-recorder${subpath}`),
          'utf8'
        )
      )
    )
    expect(modulesWithModernSyntax).toEqual([])
  })
})
