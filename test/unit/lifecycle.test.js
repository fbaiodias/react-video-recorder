import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { installFakeMedia } from './fake-media'
import {
  advance,
  click,
  recordVideo,
  renderRecorder,
  startRecording,
  turnOnCamera
} from './helpers'

const fakeStream = () => {
  const stream = {
    stopped: false,
    getTracks() {
      return [{ stop: () => (stream.stopped = true) }]
    }
  }
  return stream
}

describe('unmounting', () => {
  it('turns the camera off', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    r.unmount()
    expect(media.lastStream.isStopped).toBe(true)
    expect(r.events.at(-1)).toBe('onTurnOffCamera')
  })

  it('calls onTurnOffCamera even if the camera was never on', () => {
    installFakeMedia()
    const r = renderRecorder()
    r.unmount()
    expect(r.events).toEqual(['onTurnOffCamera'])
  })

  it('stops a stream that arrives after unmounting', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    r.unmount()

    const stream = fakeStream()
    await act(async () => pending.resolve(stream))
    expect(stream.stopped).toBe(true)
    expect(r.events).toEqual(['onTurnOnCamera', 'onTurnOffCamera'])
  })

  it('does not ask for the camera when unmounted while listing devices', async () => {
    const media = installFakeMedia()
    const devices = Promise.withResolvers()
    media.enumerateDevices.mockImplementationOnce(() => devices.promise)
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    r.unmount()

    await act(async () => devices.resolve(media.devices))
    expect(media.getUserMedia).not.toHaveBeenCalled()
  })

  it('stops the MediaRecorder silently when unmounted mid-recording', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    r.unmount()
    await advance(5000)

    expect(media.lastStream.isStopped).toBe(true)
    expect(media.lastRecorder.state).toBe('inactive')
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    expect(r.events.at(-1)).toBe('onTurnOffCamera')
  })

  it('cancels the countdown when unmounted', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(r.byQa('start-recording'))
    r.unmount()
    await advance(5000)
    expect(media.recorders).toHaveLength(0)
  })
})

describe('React.StrictMode', () => {
  it('turns the camera on once with isOnInitially', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ isOnInitially: true }, { wrapper: StrictMode })
    await advance(200)

    expect(r.byQa('start-recording')).not.toBeNull()
    expect(r.video().srcObject).toBe(media.lastStream)
    // The simulated unmount turns the camera "off" before the real mount
    // turns it on.
    expect(r.events).toEqual([
      'onTurnOffCamera',
      'onTurnOnCamera',
      'onCameraOn'
    ])
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it('records like outside StrictMode', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({}, { wrapper: StrictMode })
    await recordVideo(r)

    expect(r.events).toEqual([
      'onTurnOffCamera',
      'onTurnOnCamera',
      'onCameraOn',
      'onStartRecording',
      'onStopRecording',
      'onTurnOffCamera',
      'onRecordingComplete'
    ])
    expect(r.callbacks.onRecordingComplete.mock.calls[0][3]).toBe(1000)
    expect(media.recorders).toHaveLength(1)
    expect(r.byQa('start-replaying')).not.toBeNull()
  })

  it('opens the file picker once with isOnInitially and useVideoInput', async () => {
    installFakeMedia()
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => {})
    const r = renderRecorder(
      { isOnInitially: true, useVideoInput: true },
      { wrapper: StrictMode }
    )
    await advance(0)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(r.events).toEqual(['onTurnOffCamera', 'onOpenVideoInput'])
  })
})

describe('without StrictMode', () => {
  it('keeps working across re-renders with new props', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    r.rerenderWith({ countdownTime: 1000 })
    await startRecording(r, 1000)
    expect(media.recorders).toHaveLength(1)
  })
})
