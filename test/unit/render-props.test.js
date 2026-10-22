import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import {
  FakeMediaStream,
  installFakeMedia,
  mediaError,
  videoDevice
} from './fake-media'
import { takeConsole } from './console-capture'
import {
  actionCallbackNames,
  actionFlags,
  advance,
  click,
  recordVideo,
  renderRecorder,
  startRecording,
  turnOnCamera
} from './helpers'

describe('renderActions', () => {
  it('receives these callbacks', async () => {
    installFakeMedia()
    const r = renderRecorder()
    expect(actionCallbackNames(r.actions())).toEqual([
      'onOpenVideoInput',
      'onPauseRecording',
      'onResumeRecording',
      'onStartRecording',
      'onStopRecording',
      'onStopReplaying',
      'onSwitchCamera',
      'onTurnOffCamera',
      'onTurnOnCamera',
      't'
    ])
  })

  it('receives this state through a whole recording', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const r = renderRecorder({ timeLimit: 5000, showReplayControls: true })
    const states = {}

    states.firstRender = actionFlags(r.renderActions.mock.calls[0][0])
    await advance(0)
    states.disconnected = actionFlags(r.actions())
    await click(r.byQa('turn-on-camera'))
    states.connecting = actionFlags(r.actions())
    await act(async () => pending.resolve(new FakeMediaStream({})))
    states.cameraOnNotReady = actionFlags(r.actions())
    await advance(200)
    states.ready = actionFlags(r.actions())
    await click(r.byQa('start-recording'))
    states.countdown = actionFlags(r.actions())
    await advance(3000)
    states.recording = actionFlags(r.actions())
    await advance(1000)
    await click(r.byQa('stop-recording'))
    states.replaying = actionFlags(r.actions())

    expect(states).toMatchInlineSnapshot(`
      {
        "cameraOnNotReady": {
          "countdownTime": 3000,
          "isCameraOn": true,
          "isConnecting": true,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": undefined,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": false,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "connecting": {
          "countdownTime": 3000,
          "isCameraOn": false,
          "isConnecting": true,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": undefined,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": false,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "countdown": {
          "countdownTime": 3000,
          "isCameraOn": true,
          "isConnecting": false,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": true,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": true,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "disconnected": {
          "countdownTime": 3000,
          "isCameraOn": false,
          "isConnecting": false,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": undefined,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": false,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "firstRender": {
          "countdownTime": 3000,
          "isCameraOn": false,
          "isConnecting": false,
          "isInlineRecordingSupported": null,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": undefined,
          "isVideoInputSupported": null,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": false,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "ready": {
          "countdownTime": 3000,
          "isCameraOn": true,
          "isConnecting": false,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": undefined,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": true,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "recording": {
          "countdownTime": 3000,
          "isCameraOn": true,
          "isConnecting": false,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": true,
          "isReplayVideoMuted": true,
          "isReplayingVideo": false,
          "isRunningCountdown": false,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": true,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
        "replaying": {
          "countdownTime": 3000,
          "isCameraOn": false,
          "isConnecting": false,
          "isInlineRecordingSupported": true,
          "isPaused": false,
          "isRecording": false,
          "isReplayVideoMuted": false,
          "isReplayingVideo": true,
          "isRunningCountdown": false,
          "isVideoInputSupported": false,
          "replayVideoAutoplayAndLoopOff": undefined,
          "showReplayControls": true,
          "streamIsReady": true,
          "thereWasAnError": false,
          "timeLimit": 5000,
          "useVideoInput": undefined,
        },
      }
    `)
  })

  it('receives this state after an error', async () => {
    const media = installFakeMedia()
    media.getUserMedia.mockImplementationOnce(() =>
      Promise.reject(mediaError('NotAllowedError'))
    )
    const r = renderRecorder()
    await click(r.byQa('turn-on-camera'))
    takeConsole('error')
    expect(r.flags()).toMatchInlineSnapshot(`
      {
        "countdownTime": 3000,
        "isCameraOn": false,
        "isConnecting": false,
        "isInlineRecordingSupported": true,
        "isPaused": false,
        "isRecording": false,
        "isReplayVideoMuted": true,
        "isReplayingVideo": false,
        "isRunningCountdown": undefined,
        "isVideoInputSupported": false,
        "replayVideoAutoplayAndLoopOff": undefined,
        "showReplayControls": undefined,
        "streamIsReady": false,
        "thereWasAnError": true,
        "timeLimit": undefined,
        "useVideoInput": undefined,
      }
    `)
  })

  it('can replace the default actions entirely', async () => {
    installFakeMedia()
    const renderActions = vi.fn(({ isCameraOn, onTurnOnCamera }) => (
      <button type='button' data-qa='custom' onClick={onTurnOnCamera}>
        {isCameraOn ? 'on' : 'off'}
      </button>
    ))
    const r = renderRecorder({ renderActions })
    expect(r.byQa('turn-on-camera')).toBeNull()
    expect(r.byQa('custom').textContent).toBe('off')
    await click(r.byQa('custom'))
    expect(r.byQa('custom').textContent).toBe('on')
  })
})

describe('render*View props', () => {
  it('calls renderDisconnectedView and renderLoadingView without arguments', async () => {
    const media = installFakeMedia()
    const pending = Promise.withResolvers()
    media.getUserMedia.mockImplementationOnce(() => pending.promise)
    const renderDisconnectedView = vi.fn(() => <p>disconnected</p>)
    const renderLoadingView = vi.fn(() => <p>loading</p>)
    const r = renderRecorder({ renderDisconnectedView, renderLoadingView })

    expect(screen.getByText('disconnected')).toBeTruthy()
    expect(renderDisconnectedView.mock.calls[0]).toEqual([])
    await click(r.byQa('turn-on-camera'))
    expect(screen.getByText('loading')).toBeTruthy()
    expect(renderLoadingView.mock.calls[0]).toEqual([])
  })

  it('calls renderErrorView with the error', async () => {
    const media = installFakeMedia()
    const error = mediaError('NotAllowedError')
    media.getUserMedia.mockImplementationOnce(() => Promise.reject(error))
    const renderErrorView = vi.fn(({ error }) => <p>{error.name}</p>)
    const r = renderRecorder({ renderErrorView })
    await click(r.byQa('turn-on-camera'))

    expect(screen.getByText('NotAllowedError')).toBeTruthy()
    expect(renderErrorView.mock.lastCall).toEqual([{ error }])
    takeConsole('error')
  })

  it('calls renderUnsupportedView without arguments', async () => {
    installFakeMedia({ mediaRecorder: false })
    const renderUnsupportedView = vi.fn(() => <p>unsupported</p>)
    renderRecorder({ renderUnsupportedView })
    await advance(0)
    expect(screen.getByText('unsupported')).toBeTruthy()
    expect(renderUnsupportedView.mock.lastCall).toEqual([])
  })

  it('calls renderVideoInputView with the file input element', async () => {
    installFakeMedia({ mediaRecorder: false, inputCapture: true })
    const renderVideoInputView = vi.fn(({ videoInput }) => (
      <section>{videoInput}</section>
    ))
    const r = renderRecorder({ renderVideoInputView })
    await advance(0)

    const [{ videoInput }] = renderVideoInputView.mock.lastCall
    expect(Object.keys(renderVideoInputView.mock.lastCall[0])).toEqual([
      'videoInput'
    ])
    expect(videoInput.type).toBe('input')
    expect(videoInput.key).toBe('videoInput')
    expect(
      r.container.querySelector('section > input[type="file"]')
    ).not.toBeNull()
  })
})

describe('the t prop', () => {
  it('translates every default label', async () => {
    installFakeMedia()
    const t = vi.fn((text) => `<${text}>`)
    const r = renderRecorder({ t })
    expect(r.byQa('turn-on-camera').textContent).toBe('<Turn my camera ON>')
    await turnOnCamera(r)
    expect(r.container.textContent).toContain('<PRESS>  <REC> <WHEN READY>')
    await startRecording(r)
    await advance(500)
    await click(r.byQa('stop-recording'))
    expect(r.byQa('start-replaying').textContent).toBe('<Use another video>')

    expect([...new Set(t.mock.calls.map(([text]) => text))].sort()).toEqual([
      'PRESS',
      'REC',
      'Turn my camera ON',
      'Use another video',
      'WHEN READY'
    ])
  })

  it('translates the file input labels', async () => {
    installFakeMedia({ mediaRecorder: false, inputCapture: true })
    const t = (text) => `<${text}>`
    const r = renderRecorder({ t })
    await advance(0)
    expect(r.byQa('open-input').textContent).toBe('<Record a video>')

    installFakeMedia()
    const u = renderRecorder({ t, useVideoInput: true })
    await advance(0)
    expect(u.byQa('open-input').textContent).toBe('<Upload a video>')
  })
})

describe('class name props', () => {
  it('puts wrapperClassName on the root element', () => {
    installFakeMedia()
    const r = renderRecorder({ wrapperClassName: 'my-wrapper' })
    expect(r.container.firstElementChild.classList.contains('my-wrapper')).toBe(
      true
    )
  })

  it('applies cameraViewClassName and videoClassName to the camera and the replay', async () => {
    installFakeMedia()
    const r = renderRecorder({
      cameraViewClassName: 'my-camera-view',
      videoClassName: 'my-video'
    })
    await turnOnCamera(r)
    expect(r.video().classList.contains('my-video')).toBe(true)
    expect(r.video().parentElement.classList.contains('my-camera-view')).toBe(true)

    await startRecording(r)
    await advance(500)
    await click(r.byQa('stop-recording'))
    expect(r.video().classList.contains('my-video')).toBe(true)
    expect(r.video().parentElement.classList.contains('my-camera-view')).toBe(true)
  })
})

describe('the replay video', () => {
  it('passes the replay props to the <video> element', async () => {
    installFakeMedia()
    const r = renderRecorder({
      showReplayControls: true,
      videoControlsList: 'nodownload',
      disablePictureInPicture: true
    })
    await recordVideo(r)

    const video = r.video()
    expect(video.controls).toBe(true)
    expect(video.getAttribute('controlslist')).toBe('nodownload')
    expect(video.hasAttribute('disablepictureinpicture')).toBe(true)
    expect(video.loop).toBe(true)
    expect(video.autoplay).toBe(true)
  })

  it('toggles mute on click', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await recordVideo(r)
    expect(r.video().muted).toBe(false)

    fireEvent.click(r.video())
    await advance(0)
    expect(r.flags().isReplayVideoMuted).toBe(true)
    expect(r.video().muted).toBe(true)

    fireEvent.click(r.video())
    await advance(0)
    expect(r.flags().isReplayVideoMuted).toBe(false)
  })

  it('calls play() on click only when paused and without controls', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await recordVideo(r)
    Object.defineProperty(r.video(), 'paused', {
      value: false,
      configurable: true
    })
    fireEvent.click(r.video())
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)

    Object.defineProperty(r.video(), 'paused', {
      value: true,
      configurable: true
    })
    fireEvent.click(r.video())
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
    await advance(0)
  })

  it('does not call play() on click with showReplayControls', async () => {
    installFakeMedia()
    const r = renderRecorder({ showReplayControls: true })
    await recordVideo(r)
    Object.defineProperty(r.video(), 'paused', {
      value: true,
      configurable: true
    })
    fireEvent.click(r.video())
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)
  })

  it('falls back to muted autoplay when unmuted playback is blocked', async () => {
    installFakeMedia()
    const blocked = mediaError('NotAllowedError')
    HTMLMediaElement.prototype.play.mockImplementationOnce(() =>
      Promise.reject(blocked)
    )
    const r = renderRecorder()
    await recordVideo(r)

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
    expect(r.video().muted).toBe(true)
    expect(r.flags().isReplayVideoMuted).toBe(true)
    expect(takeConsole('warn')).toEqual([
      ['Could not autoplay replay video', blocked]
    ])
  })

  it('keeps the replay muted when play() returns nothing', async () => {
    installFakeMedia()
    HTMLMediaElement.prototype.play.mockImplementationOnce(() => undefined)
    const r = renderRecorder()
    await recordVideo(r)
    expect(r.video().muted).toBe(true)
    expect(r.flags().isReplayVideoMuted).toBe(true)
  })

  it('pauses after unmuting and keeps mute on click with replayVideoAutoplayAndLoopOff', async () => {
    installFakeMedia()
    const r = renderRecorder({
      replayVideoAutoplayAndLoopOff: true,
      showReplayControls: true
    })
    await recordVideo(r)

    const video = r.video()
    expect(video.autoplay).toBe(false)
    expect(HTMLMediaElement.prototype.pause.mock.contexts).toContain(video)
    expect(video.loop).toBe(false)

    fireEvent.click(video)
    await advance(0)
    expect(r.flags().isReplayVideoMuted).toBe(false)
  })
})

describe('styles that depend on props', () => {
  const transformOf = (element) =>
    getComputedStyle(element).transform.replace(/\s/g, '')

  it('mirrors the camera by default', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(transformOf(r.video())).toBe('translate(-50%,-50%)scaleX(-1)')
  })

  it('does not mirror a rear camera', async () => {
    installFakeMedia({ devices: [videoDevice('back', 'Back', 'environment')] })
    const r = renderRecorder()
    await turnOnCamera(r)
    expect(transformOf(r.video())).toBe('translate(-50%,-50%)')
  })

  it('does not mirror the camera with isFlipped={false}', async () => {
    installFakeMedia()
    const r = renderRecorder({ isFlipped: false })
    await turnOnCamera(r)
    expect(transformOf(r.video())).toBe('translate(-50%,-50%)')
  })

  it('never mirrors the replay', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await recordVideo(r)
    expect(transformOf(r.video())).toBe('translate(-50%,-50%)')
    expect(getComputedStyle(r.video()).cursor).toBe('pointer')
  })
})
