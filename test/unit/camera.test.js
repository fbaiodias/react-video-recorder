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

  it('uses the constraints as given when turning the camera on', async () => {
    const media = installFakeMedia({
      devices: [videoDevice('camera-1'), videoDevice('camera-2')]
    })
    const constraints = { audio: false, video: { width: 1280 } }
    const r = renderRecorder({ constraints })
    await turnOnCamera(r)
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
    expect(media.getUserMedia).toHaveBeenCalledWith(constraints)
  })

  it('asks for any camera with the default constraints', async () => {
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

  it('lets facingMode pick the camera', async () => {
    const media = installFakeMedia({
      devices: [
        videoDevice('front', 'Front', 'user'),
        videoDevice('back', 'Back', 'environment')
      ],
      hideDeviceIdsUntilPermission: true
    })
    const r = renderRecorder({
      constraints: { audio: true, video: { facingMode: 'environment' } }
    })
    await turnOnCamera(r)
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
    expect(media.lastStream.getVideoTracks()[0].getSettings().deviceId).toBe(
      'back'
    )
    expect(takeConsole('warn')).toEqual([])
  })

  it('lets a deviceId in the constraints win over the selected one', async () => {
    const media = installFakeMedia({
      devices: [videoDevice('camera-1'), videoDevice('my-camera')]
    })
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
      "Camera access is blocked. Allow it in your browser's site settings and try again."
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
    expect(r.container.textContent).toContain('Camera access is blocked.')
    takeConsole('warn')
    takeConsole('error')
  })

  it('says when the camera is in use by another app', async () => {
    const media = installFakeMedia()
    media.getUserMedia.mockImplementation(() =>
      Promise.reject(mediaError('NotReadableError'))
    )
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))
    expect(r.container.textContent).toContain(
      'The camera is in use by another app. Close it and try again.'
    )
    takeConsole('warn')
    takeConsole('error')
  })

  it('keeps the general message for other errors', async () => {
    const media = installFakeMedia()
    media.getUserMedia.mockImplementationOnce(() =>
      Promise.reject(mediaError('UnknownError'))
    )
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))
    expect(r.container.textContent).toContain(
      'Oh snap! Your browser failed to record your video.Please restart it and try again 👍'
    )
    takeConsole('error')
  })

  it('translates the error messages with t, falling back to English', async () => {
    const media = installFakeMedia()
    media.getUserMedia.mockImplementationOnce(() =>
      Promise.reject(mediaError('NotFoundError'))
    )
    const dictionary = {
      'No camera was found. Connect one and try again.': 'Nenhuma câmara.'
    }
    const r = renderRecorder({ t: (text) => dictionary[text] })
    await click(r.byQa('turn-on-camera'))
    expect(r.container.textContent).toContain('Nenhuma câmara.')

    await act(async () => r.actions().onTurnOnCamera())
    await advance(200)
    media.getUserMedia.mockImplementationOnce(() =>
      Promise.reject(mediaError('UnknownError'))
    )
    await act(async () => r.actions().onTurnOffCamera())
    await act(async () => r.actions().onTurnOnCamera())
    // No translation for these: English.
    expect(r.container.textContent).toContain('Oh snap!')
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

  it("reports the browser's NotFoundError when there is no camera", async () => {
    const media = installFakeMedia({ devices: [audioDevice('mic-1')] })
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))

    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('NotFoundError')
    expect(r.container.textContent).toContain(
      'No camera was found. Connect one and try again.'
    )
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

  it('shows the new stream after switching', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)

    await click(switchButton(r))
    await advance(200)
    expect(media.streams).toHaveLength(2)
    expect(r.video().srcObject).toBe(media.streams[1])
  })

  it('asks for the next camera with the default constraints', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(switchButton(r))
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-2' } }
    })
    await advance(200)
    expect(r.video().srcObject.getVideoTracks()[0].getSettings().deviceId).toBe(
      'camera-2'
    )
  })

  it('switches with the real camera ids once access is granted', async () => {
    const media = installFakeMedia({
      devices: [videoDevice('camera-1'), videoDevice('camera-2')],
      hideDeviceIdsUntilPermission: true
    })
    const r = renderRecorder()
    await turnOnCamera(r)
    await click(switchButton(r))
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-2' } }
    })
  })

  it('switches from the camera the constraints picked', async () => {
    const media = installFakeMedia({
      devices: [
        videoDevice('front', 'Front', 'user'),
        videoDevice('back', 'Back', 'environment')
      ]
    })
    const r = renderRecorder({
      constraints: { audio: true, video: { facingMode: 'environment' } }
    })
    await turnOnCamera(r)
    await click(switchButton(r))
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { facingMode: 'environment', deviceId: { exact: 'front' } }
    })
  })

  it('reports a camera that disappeared when switching', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    media.devices = [videoDevice('camera-1')]
    await click(switchButton(r))

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('ReactVideoRecorderDeviceUnavailableError')
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
    takeConsole('error')
  })

  it('lists the cameras with labels once access is granted', async () => {
    installFakeMedia({
      devices: [
        videoDevice('front', 'Front camera'),
        audioDevice('mic-1'),
        videoDevice('back', 'Back camera')
      ],
      hideDeviceIdsUntilPermission: true
    })
    const r = renderRecorder()
    expect(r.flags().devices).toEqual([])
    await turnOnCamera(r)

    expect(r.flags().devices).toEqual([
      { deviceId: 'front', label: 'Front camera' },
      { deviceId: 'back', label: 'Back camera' }
    ])
    expect(r.flags().currentDeviceId).toBe('front')
  })

  it('switches to a camera picked from the list', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    await act(async () => r.actions().onSelectDevice('camera-2'))

    expect(media.streams[0].isStopped).toBe(true)
    expect(media.getUserMedia).toHaveBeenLastCalledWith({
      audio: true,
      video: { deviceId: { exact: 'camera-2' } }
    })
    await advance(200)
    expect(r.flags().currentDeviceId).toBe('camera-2')
    expect(r.events.slice(-3)).toEqual([
      'onSwitchCamera',
      'onTurnOnCamera',
      'onCameraOn'
    ])
  })

  it('updates the list when a camera is plugged in or out', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(r.flags().devices).toHaveLength(2)

    media.devices = [...media.devices, videoDevice('camera-3', 'USB camera')]
    await act(async () => media.emitDeviceChange())
    expect(r.flags().devices.map((device) => device.deviceId)).toEqual([
      'camera-1',
      'camera-2',
      'camera-3'
    ])

    media.devices = [videoDevice('camera-1')]
    await act(async () => media.emitDeviceChange())
    expect(r.flags().devices).toEqual([
      { deviceId: 'camera-1', label: 'camera-1' }
    ])
    // One camera left: no switch button.
    expect(r.video().nextElementSibling).toBeNull()
  })

  it('stops listening for camera changes when unmounted', async () => {
    const media = twoCameras()
    const r = renderRecorder()
    await turnOnCamera(r)
    r.unmount()
    const calls = media.enumerateDevices.mock.calls.length
    await act(async () => media.emitDeviceChange())
    expect(media.enumerateDevices.mock.calls.length).toBe(calls)
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
