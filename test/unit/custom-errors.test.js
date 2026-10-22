import { describe, expect, it } from 'vitest'
import * as errors from '../../src/custom-errors'

// Apps match on these names and messages, so they're part of the public API.
describe('custom errors', () => {
  it('exports exactly these', () => {
    expect(Object.keys(errors).sort()).toEqual([
      'ReactVideoRecorderDataAvailableTimeoutError',
      'ReactVideoRecorderDataIssueError',
      'ReactVideoRecorderDeviceUnavailableError',
      'ReactVideoRecorderMediaRecorderUnavailableError',
      'ReactVideoRecorderRecordedBlobsUnavailableError',
      'getErrorCode'
    ])
  })

  const domError = (name) => Object.assign(new Error(name), { name })

  it.each([
    [domError('NotAllowedError'), 'permission-denied'],
    [domError('SecurityError'), 'permission-denied'],
    [domError('NotFoundError'), 'no-camera'],
    [domError('OverconstrainedError'), 'no-camera'],
    [new errors.ReactVideoRecorderDeviceUnavailableError(), 'no-camera'],
    [domError('NotReadableError'), 'camera-in-use'],
    [domError('AbortError'), 'camera-in-use'],
    [new errors.ReactVideoRecorderDataAvailableTimeoutError(750), 'no-data'],
    [
      new errors.ReactVideoRecorderDataIssueError(new Event('dataavailable')),
      'no-data'
    ],
    [
      new errors.ReactVideoRecorderRecordedBlobsUnavailableError(
        new Event('stop')
      ),
      'no-data'
    ],
    [
      new errors.ReactVideoRecorderMediaRecorderUnavailableError(),
      'recorder-failed'
    ],
    [domError('NotSupportedError'), 'recorder-failed'],
    [new Event('error'), 'recorder-failed'],
    [new TypeError('boom'), 'unknown'],
    ['a string', 'unknown'],
    [null, 'unknown']
  ])('getErrorCode(%s) is %s', (error, code) => {
    expect(errors.getErrorCode(error)).toBe(code)
  })

  it.each([
    [
      'ReactVideoRecorderDataIssueError',
      ['event'],
      "Couldn't get data from event",
      { event: 'event' }
    ],
    [
      'ReactVideoRecorderRecordedBlobsUnavailableError',
      ['event'],
      "Couldn't get recordedBlobs",
      { event: 'event' }
    ],
    [
      'ReactVideoRecorderDataAvailableTimeoutError',
      [750],
      "Method mediaRecorder.ondataavailable wasn't called after 750ms",
      { dataAvailableTimeout: 750 }
    ],
    [
      'ReactVideoRecorderMediaRecorderUnavailableError',
      [],
      "Couldn't get mediaRecorder",
      {}
    ],
    [
      'ReactVideoRecorderDeviceUnavailableError',
      [],
      "Couldn't get selected device",
      {}
    ]
  ])('%s', (name, args, message, extra) => {
    const error = new errors[name](...args)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(errors[name])
    expect(error.name).toBe(name)
    expect(error.message).toBe(message)
    expect(error).toMatchObject(extra)
  })
})
