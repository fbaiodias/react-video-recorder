import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { uninstallFakeMedia } from './fake-media'
import { assertNoConsoleLeft, captureConsole } from './console-capture'

// fix-webm-duration parses real WebM bytes; the tests only care about the
// duration the component asks it to write.
vi.mock('fix-webm-duration', () => ({
  default: vi.fn((blob) => Promise.resolve(blob))
}))

let objectUrlCount = 0

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  vi.clearAllMocks()
  captureConsole()

  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
    Promise.resolve()
  )
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})

  vi.spyOn(
    HTMLCanvasElement.prototype,
    'getContext'
  ).mockImplementation(() => ({ drawImage: vi.fn() }))
  // Async like the real one, but without a timer: fake timers would push a
  // 0ms timeout scheduled mid-tick to 1ms and skew every duration.
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (callback, type) => {
      Promise.resolve().then(() => callback(new Blob(['thumbnail'], { type })))
    }
  )

  objectUrlCount = 0
  URL.createObjectURL = vi.fn(() => `blob:fake/${++objectUrlCount}`)
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  uninstallFakeMedia()
  assertNoConsoleLeft()
})
