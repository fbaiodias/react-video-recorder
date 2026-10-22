import { describe, expect, it } from 'vitest'
import * as errors from '../../src/custom-errors'

// Apps match on these names and messages, so they're part of the public API.
describe('custom errors', () => {
  it('exports exactly these classes', () => {
    expect(Object.keys(errors).sort()).toEqual([
      'ReactVideoRecorderDataAvailableTimeoutError',
      'ReactVideoRecorderDataIssueError',
      'ReactVideoRecorderDeviceUnavailableError',
      'ReactVideoRecorderMediaRecorderUnavailableError',
      'ReactVideoRecorderRecordedBlobsUnavailableError'
    ])
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
