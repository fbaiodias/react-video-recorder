import { StrictMode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { installFakeMedia } from './fake-media'
import {
  advance,
  click,
  renderRecorder,
  startRecording,
  turnOnCamera
} from './helpers'

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

  it('[known bug] never stops a stream that arrives after unmounting', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const r = renderRecorder({ isOnInitially: true })
    await advance(0)
    r.unmount()

    const lateStream = media.lastStream ?? null
    expect(lateStream).toBeNull()
    const stream = {
      stopped: false,
      getTracks () {
        return [{ stop: () => (stream.stopped = true) }]
      }
    }
    await act(async () => pending.resolve(stream))
    expect(stream.stopped).toBe(false)
    expect(r.events).not.toContain('onCameraOn')
  })

  it('[known bug] leaves the MediaRecorder running when unmounted mid-recording', async () => {
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

  it('[known bug] still tries to start recording when unmounted during the countdown', async () => {
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
  it('[known bug] gets stuck on the loading view with isOnInitially', async () => {
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

  it('[known bug] gets stuck on the loading view after turning the camera on', async () => {
    installFakeMedia()
    const r = renderRecorder({}, { wrapper: StrictMode })
    await click(r.byQa('turn-on-camera'))
    await advance(1000)

    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(r.events).toEqual(['onTurnOffCamera', 'onTurnOnCamera'])
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
