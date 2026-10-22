import { describe, expect, it } from 'vitest'
import { act, screen } from '@testing-library/react'
import {
  audioDevice,
  installFakeMedia,
  mediaError,
  videoDevice
} from './fake-media'
import { takeConsole } from './console-capture'
import {
  IS_LEGACY,
  advance,
  click,
  renderRecorder,
  startRecording,
  turnOnCamera
} from './helpers'

describe('turning the camera on', () => {
  it('turns on at mount with isOnInitially and shows the loading view meanwhile', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const r = renderRecorder({ isOnInitially: true })

    expect(r.events).toEqual(['onTurnOnCamera'])
    await advance(0)
    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(r.container.querySelectorAll('button')).toHaveLength(0)

    const stream = { getTracks: () => [] }
    await act(async () => pending.resolve(stream))
    expect(r.video().srcObject).toBe(stream)
    expect(r.events).toEqual(['onTurnOnCamera', 'onCameraOn'])
  })

  it('[known bug] drops the selected deviceId when constraints.video is true (the default)', async () => {
    const media = installFakeMedia({
      devices: [videoDevice('camera-1'), videoDevice('camera-2')]
    })
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(media.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: true
    })
  })

  it('adds the selected deviceId to object video constraints', async () => {
    const media = installFakeMedia({
      devices: [
        audioDevice('mic-1'),
        videoDevice('camera-1'),
        videoDevice('camera-2')
      ]
    })
    const constraints = { audio: false, video: { width: 1280 } }
    const r = renderRecorder({ constraints })
    await turnOnCamera(r)
    expect(media.getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { width: 1280, deviceId: { exact: 'camera-1' } }
    })
    // The prop itself isn't mutated.
    expect(constraints).toEqual({ audio: false, video: { width: 1280 } })
  })

  it('lets a deviceId in the constraints win over the selected one', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({
      constraints: { audio: true, video: { deviceId: 'my-camera' } }
    })
    await turnOnCamera(r)
    expect(media.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: { deviceId: 'my-camera' }
    })
  })

  it.each(['NotReadableError', 'OverconstrainedError'])(
    'retries with plain constraints after a %s',
    async (name) => {
      const media = installFakeMedia()
      const error = mediaError(name)
      media.getUserMedia.mockImplementationOnce(() => Promise.reject(error))
      const r = renderRecorder({
        constraints: { audio: true, video: { width: 1280 } }
      })
      await turnOnCamera(r)

      expect(media.getUserMedia).toHaveBeenCalledTimes(2)
      expect(media.getUserMedia).toHaveBeenLastCalledWith({
        audio: true,
        video: true
      })
      expect(r.video().srcObject).toBe(media.lastStream)
      expect(r.callbacks.onError).not.toHaveBeenCalled()
      expect(takeConsole('warn')).toEqual([
        [`Got ${name}, trying getUserMedia again with fallback constraints`]
      ])
    }
  )

  it('shows the error view when getUserMedia fails', async () => {
    const media = installFakeMedia()
    const error = mediaError('NotAllowedError', 'Permission denied')
    media.getUserMedia.mockImplementationOnce(() => Promise.reject(error))
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))

    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
    expect(r.callbacks.onError).toHaveBeenCalledWith(error)
    expect(r.container.textContent).toContain(
      'Oh snap! Your browser failed to record your video.Please restart it and try again 👍'
    )
    expect(r.container.querySelectorAll('button')).toHaveLength(0)
    expect(r.events).toEqual(['onTurnOnCamera', 'onError'])
    expect(takeConsole('error')).toEqual([['Captured error', error]])
  })

  it('shows the error view when the fallback getUserMedia also fails', async () => {
    const media = installFakeMedia()
    const fallbackError = mediaError('NotAllowedError')
    media.getUserMedia
      .mockImplementationOnce(() =>
        Promise.reject(mediaError('NotReadableError'))
      )
      .mockImplementationOnce(() => Promise.reject(fallbackError))
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))

    expect(r.callbacks.onError).toHaveBeenCalledWith(fallbackError)
    expect(r.container.textContent).toContain('Oh snap!')
    takeConsole('warn')
    takeConsole('error')
  })

  it('shows the error view when enumerateDevices fails', async () => {
    const media = installFakeMedia()
    const error = new Error('enumerateDevices failed')
    media.enumerateDevices.mockImplementationOnce(() => Promise.reject(error))
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))

    expect(media.getUserMedia).not.toHaveBeenCalled()
    expect(r.callbacks.onError).toHaveBeenCalledWith(error)
    takeConsole('error')
  })

  it('[known bug] fails with a TypeError when there is no camera', async () => {
    const media = installFakeMedia({ devices: [audioDevice('mic-1')] })
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))

    expect(media.getUserMedia).not.toHaveBeenCalled()
    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error).toBeInstanceOf(TypeError)
    expect(r.container.textContent).toContain('Oh snap!')
    takeConsole('error')
  })

  it('can turn the camera on again after an error', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    media.getUserMedia.mockImplementationOnce(() =>
      Promise.reject(mediaError('NotAllowedError'))
    )
    await click(r.byQa('turn-on-camera'))
    takeConsole('error')

    await act(async () => r.actions().onTurnOnCamera())
    await advance(200)
    expect(r.video().srcObject).toBe(media.lastStream)
    expect(r.flags().thereWasAnError).toBe(false)
    expect(r.byQa('start-recording')).not.toBeNull()
  })
})

describe('turning the camera off', () => {
  it('stops the stream and goes back to the disconnected view', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await act(async () => r.actions().onTurnOffCamera())

    expect(media.lastStream.isStopped).toBe(true)
    expect(r.video()).toBeNull()
    expect(r.byQa('turn-on-camera')).not.toBeNull()
    expect(r.events.at(-1)).toBe('onTurnOffCamera')
    // streamIsReady stays true after the camera is off.
    expect(r.flags()).toMatchObject({ isCameraOn: false, streamIsReady: true })
  })
})

describe('switching cameras', () => {
  const twoCameras = () =>
    installFakeMedia({
      devices: [
        videoDevice('camera-1'),
        audioDevice('mic-1'),
        videoDevice('camera-2')
      ]
    })
  const switchButton = (r) => r.video()?.nextElementSibling

  it('shows the switch button only with two or more cameras', async () => {
    installFakeMedia({ devices: [videoDevice('camera-1')] })
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(switchButton(r)).toBeNull()
  })

  it('hides the switch button while recording', async () => {
    twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(switchButton(r).querySelector('svg')).not.toBeNull()

    await click(r.byQa('start-recording'))
    // Still visible during the countdown.
    expect(switchButton(r)).not.toBeNull()
    await advance(3000)
    expect(switchButton(r)).toBeNull()
  })

  it('cycles through the cameras', async () => {
    const media = twoCameras()
    const r = renderRecorder({ constraints: { audio: true, video: {} } })
    await turnOnCamera(r)
    const firstStream = media.lastStream

    await click(switchButton(r))
    expect(firstStream.isStopped).toBe(true)
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-2' } }
    })
    expect(r.events).toEqual([
      'onTurnOnCamera',
      'onCameraOn',
      'onSwitchCamera',
      'onTurnOnCamera',
      'onCameraOn'
    ])

    await advance(200)
    await click(switchButton(r))
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-1' } }
    })
  })

  it.runIf(IS_LEGACY)('[known bug] keeps showing the first, stopped stream after switching', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    const firstStream = media.lastStream

    await click(switchButton(r))
    await advance(200)
    expect(media.streams).toHaveLength(2)
    expect(r.video().srcObject).toBe(firstStream)
  })

  it.skipIf(IS_LEGACY)('shows the new stream after switching', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)

    await click(switchButton(r))
    await advance(200)
    expect(media.streams).toHaveLength(2)
    expect(r.video().srcObject).toBe(media.streams[1])
  })

  it('[known bug] asks for the default camera again when constraints.video is true', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(switchButton(r))
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: true
    })
  })

  it('[known bug] never reports a missing camera when switching', async () => {
    const media = twoCameras()
    const r = renderRecorder({ constraints: { audio: true, video: {} } })
    await turnOnCamera(r)
    media.devices = [videoDevice('camera-1')]
    await click(switchButton(r))

    // The device check only looks for any camera with an id, so it asks for
    // camera-2 even though it's gone.
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-2' } }
    })
  })

  it('also switches through the renderActions callback', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    await act(async () => r.actions().onSwitchCamera())
    expect(media.getUserMedia).toHaveBeenCalledTimes(2)
    expect(r.events).toContain('onSwitchCamera')
  })

  it('keeps recording from the stream it started with', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    expect(media.lastRecorder.stream).toBe(media.streams[0])
  })
})
