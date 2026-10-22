import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { installFakeMedia } from './fake-media'
import {
  IS_LEGACY,
  advance,
  click,
  recordVideo,
  renderRecorder,
  startRecording,
  turnOnCamera
} from './helpers'

// The class had these lifecycle bugs; the hooks version cleans up on unmount
// by design. Each bug keeps its legacy test (it.runIf(IS_LEGACY)) until the
// class is removed, next to a test of the fixed behavior.

const fakeStream = () => {
  const stream = {
    stopped: false,
    getTracks () {
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

  it.runIf(IS_LEGACY)('[known bug] never stops a stream that arrives after unmounting', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    r.unmount()

    const stream = fakeStream()
    await act(async () => pending.resolve(stream))
    expect(stream.stopped).toBe(false)
    expect(r.events).not.toContain('onCameraOn')
  })

  it.skipIf(IS_LEGACY)('stops a stream that arrives after unmounting', async () => {
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

  it.skipIf(IS_LEGACY)('does not ask for the camera when unmounted while listing devices', async () => {
    const media = installFakeMedia()
    const devices = Promise.withResolvers()
    media.enumerateDevices.mockImplementationOnce(() => devices.promise)
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    r.unmount()

    await act(async () => devices.resolve(media.devices))
    expect(media.getUserMedia).not.toHaveBeenCalled()
  })

  it.runIf(IS_LEGACY)('[known bug] leaves the MediaRecorder running when unmounted mid-recording', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    r.unmount()
    await advance(5000)

    expect(media.lastStream.isStopped).toBe(true)
    expect(media.lastRecorder.state).toBe('recording')
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
  })

  it.skipIf(IS_LEGACY)('stops the MediaRecorder silently when unmounted mid-recording', async () => {
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

  it.skipIf(IS_LEGACY)('cancels the countdown when unmounted', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(r.byQa('start-recording'))
    r.unmount()
    await advance(5000)
    expect(media.recorders).toHaveLength(0)
  })

  it.runIf(IS_LEGACY)('[known bug] still tries to start recording when unmounted during the countdown', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(r.byQa('start-recording'))
    r.unmount()

    // The countdown timer isn't cleared, so startRecording() runs and
    // captureThumb() reads videoWidth from the now-null video ref. That
    // rejection is unhandled; vitest.config.mjs ignores it for this test.
    const rejections = []
    const onRejection = (reason) => rejections.push(reason)
    process.on('unhandledRejection', onRejection)
    try {
      await advance(3000)
      vi.useRealTimers()
      await new Promise((resolve) => setTimeout(resolve, 10))
    } finally {
      process.off('unhandledRejection', onRejection)
    }

    expect(rejections).toHaveLength(1)
    expect(rejections[0]).toBeInstanceOf(TypeError)
    expect(rejections[0].message).toContain("reading 'videoWidth'")
    expect(media.recorders).toHaveLength(0)
  })
})

describe('React.StrictMode', () => {
  it.runIf(IS_LEGACY)('[known bug] gets stuck on the loading view with isOnInitially', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ isOnInitially: true }, { wrapper: StrictMode })
    await advance(1000)

    expect(screen.getByText('Loading...')).toBeTruthy()
    // StrictMode's simulated unmount sets isComponentUnmounted for good, and
    // both mounts' setState callbacks turn the camera on.
    expect(r.events).toEqual([
      'onTurnOffCamera',
      'onTurnOnCamera',
      'onTurnOnCamera'
    ])
    expect(media.getUserMedia).toHaveBeenCalledTimes(2)
    // Both streams are left running.
    expect(media.streams.map((stream) => stream.isStopped)).toEqual([
      false,
      false
    ])
  })

  it.runIf(IS_LEGACY)('[known bug] gets stuck on the loading view after turning the camera on', async () => {
    installFakeMedia()
    const r = renderRecorder({}, { wrapper: StrictMode })
    await click(r.byQa('turn-on-camera'))
    await advance(1000)

    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(r.events).toEqual(['onTurnOffCamera', 'onTurnOnCamera'])
  })

  it.skipIf(IS_LEGACY)('turns the camera on once with isOnInitially', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ isOnInitially: true }, { wrapper: StrictMode })
    await advance(200)

    expect(r.byQa('start-recording')).not.toBeNull()
    expect(r.video().srcObject).toBe(media.lastStream)
    // The simulated unmount turns the camera "off" before the real mount
    // turns it on.
    expect(r.events).toEqual(['onTurnOffCamera', 'onTurnOnCamera', 'onCameraOn'])
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it.skipIf(IS_LEGACY)('records like outside StrictMode', async () => {
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

  it.skipIf(IS_LEGACY)('opens the file picker once with isOnInitially and useVideoInput', async () => {
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
