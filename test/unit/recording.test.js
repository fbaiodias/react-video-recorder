import { describe, expect, it } from 'vitest'
import { act, screen } from '@testing-library/react'
import fixWebmDuration from 'fix-webm-duration'
import { installFakeMedia } from './fake-media'
import { takeConsole } from './console-capture'
import {
  IS_LEGACY,
  advance,
  click,
  recordVideo,
  renderRecorder,
  startRecording,
  stopRecording,
  turnOnCamera
} from './helpers'

// These tests pin down what the component does today, including known bugs
// (tests named "[known bug] ..."). They're the reference for the TypeScript
// and hooks rewrites: a change in behavior should show up here first.

describe('recording a video inline', () => {
  it('goes from the disconnected view to a replay of the recording', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()

    expect(r.container.querySelector('.SVGInline svg')).not.toBeNull()
    expect(r.byQa('turn-on-camera').textContent).toBe('Turn my camera ON')
    expect(r.video()).toBeNull()

    await click(r.byQa('turn-on-camera'))
    expect(r.video().srcObject).toBe(media.lastStream)
    expect(r.video().autoplay).toBe(true)
    expect(r.video().muted).toBe(true)
    // The record button waits 200ms after the stream arrives.
    expect(r.byQa('start-recording')).toBeNull()
    await advance(199)
    expect(r.byQa('start-recording')).toBeNull()
    await advance(1)
    expect(r.byQa('start-recording').textContent).toBe('')
    expect(r.container.textContent).toContain('PRESS  REC WHEN READY')

    await click(r.byQa('start-recording'))
    expect(screen.getByText('3')).toBeTruthy()
    expect(r.byQa('start-recording')).toBeNull()
    await advance(1000)
    expect(screen.getByText('2')).toBeTruthy()
    await advance(1000)
    expect(screen.getByText('1')).toBeTruthy()
    expect(media.recorders).toHaveLength(0)
    await advance(1000)

    const recordingStartedAt = Date.now()
    const recorder = media.lastRecorder
    expect(recorder.stream).toBe(media.lastStream)
    expect(recorder.options).toEqual({
      mimeType: 'video/webm;codecs="vp8,opus"'
    })
    expect(recorder.calls).toEqual([['start', 250]])
    expect(r.byQa('stop-recording')).not.toBeNull()
    expect(screen.getByText('0s')).toBeTruthy()

    await advance(1000)
    expect(screen.getByText('1s')).toBeTruthy()
    await stopRecording(r)

    expect(recorder.calls).toEqual([['start', 250], ['stop']])
    expect(fixWebmDuration).toHaveBeenCalledTimes(1)
    expect(fixWebmDuration.mock.calls[0][1]).toBe(1000)

    expect(r.callbacks.onRecordingComplete).toHaveBeenCalledTimes(1)
    const [
      videoBlob,
      startedAt,
      thumbnail,
      duration,
      extension
    ] = r.callbacks.onRecordingComplete.mock.calls[0]
    expect(videoBlob).toBe(fixWebmDuration.mock.calls[0][0])
    expect(videoBlob.type).toBe('video/webm;codecs="vp8,opus"')
    // 4 chunks at 250ms intervals plus the final one emitted on stop.
    expect(await videoBlob.text()).toBe('chunk-1chunk-2chunk-3chunk-4chunk-5')
    expect(startedAt).toBe(recordingStartedAt)
    expect(thumbnail).toBeInstanceOf(Blob)
    expect(thumbnail.type).toBe('image/jpeg')
    expect(duration).toBe(1000)
    expect(extension).toBeUndefined()
    expect(r.callbacks.onRecordingComplete.mock.calls[0]).toHaveLength(4)

    expect(media.lastStream.isStopped).toBe(true)
    expect(r.events).toEqual([
      'onTurnOnCamera',
      'onCameraOn',
      'onStartRecording',
      'onStopRecording',
      'onTurnOffCamera',
      'onRecordingComplete'
    ])

    const replay = r.video()
    expect(replay.srcObject).toBeUndefined()
    expect(replay.getAttribute('src')).toBe('blob:fake/1')
    expect(URL.createObjectURL).toHaveBeenCalledWith(videoBlob)
    expect(replay.loop).toBe(true)
    expect(replay.autoplay).toBe(true)
    expect(replay.controls).toBe(false)
    // tryToUnmuteReplayVideo() unmutes it once play() resolves.
    expect(replay.muted).toBe(false)
    expect(r.flags().isReplayVideoMuted).toBe(false)
    expect(r.byQa('start-replaying').textContent).toBe('Use another video')

    await click(r.byQa('start-replaying'))
    expect(r.events.at(-1)).toBe('onStopReplaying')
    expect(r.video()).toBeNull()
    expect(r.byQa('turn-on-camera')).not.toBeNull()
    expect(media.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it('turns the camera back on after replaying when isOnInitially is set', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ isOnInitially: true })
    await advance(200)
    await startRecording(r)
    await advance(500)
    await stopRecording(r)

    await click(r.byQa('start-replaying'))
    expect(media.getUserMedia).toHaveBeenCalledTimes(2)
    expect(r.video().srcObject).toBe(media.lastStream)
    expect(r.events.slice(-3)).toEqual([
      'onStopReplaying',
      'onTurnOnCamera',
      'onCameraOn'
    ])
  })

  it('records a single-chunk video as that chunk, not a new Blob', async () => {
    installFakeMedia()
    const r = renderRecorder({ chunkSize: 10000, dataAvailableTimeout: null })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(500)
    await stopRecording(r)

    const [videoBlob] = r.callbacks.onRecordingComplete.mock.calls[0]
    expect(await videoBlob.text()).toBe('chunk-1')
  })

  it.runIf(IS_LEGACY)('[known bug] fails when chunkSize is longer than dataAvailableTimeout', async () => {
    installFakeMedia()
    const r = renderRecorder({ chunkSize: 1000 })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(500)
    expect(r.callbacks.onError.mock.calls[0][0].name).toBe(
      'ReactVideoRecorderDataAvailableTimeoutError'
    )
    takeConsole('error')
  })

  it.skipIf(IS_LEGACY)('waits for the first chunk before checking for data', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ chunkSize: 1000 })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(3000)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    expect(media.lastRecorder.state).toBe('recording')
  })

  it('passes chunkSize to MediaRecorder.start()', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ chunkSize: 400 })
    await turnOnCamera(r)
    await startRecording(r)
    expect(media.lastRecorder.calls).toEqual([['start', 400]])
  })

  it('waits countdownTime before recording', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ countdownTime: 1000 })
    await turnOnCamera(r)
    await click(r.byQa('start-recording'))
    expect(screen.getByText('1')).toBeTruthy()
    await advance(999)
    expect(media.recorders).toHaveLength(0)
    await advance(1)
    expect(media.recorders).toHaveLength(1)
  })

  it('starts right away with countdownTime 0', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ countdownTime: 0 })
    await turnOnCamera(r)
    await click(r.byQa('start-recording'))
    expect(media.recorders).toHaveLength(1)
  })

  it('stops by itself after timeLimit and counts the timer down', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ timeLimit: 2000 })
    await turnOnCamera(r)
    await startRecording(r)
    expect(screen.getByText('2s')).toBeTruthy()
    await advance(1000)
    expect(screen.getByText('1s')).toBeTruthy()
    await advance(1000)
    await advance(0)

    expect(media.lastRecorder.calls.at(-1)).toEqual(['stop'])
    expect(r.events).toContain('onStopRecording')
    expect(r.callbacks.onRecordingComplete.mock.calls[0][3]).toBe(2000)
    expect(fixWebmDuration.mock.calls[0][1]).toBe(2000)
  })

  it('formats the timer as minutes past 60 seconds', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(61000)
    expect(screen.getByText('1:01')).toBeTruthy()
  })
})

describe('picking the mime type', () => {
  const recordWith = async (props, mediaOptions) => {
    const media = installFakeMedia(mediaOptions)
    const r = renderRecorder(props)
    await recordVideo(r, 500)
    return {
      media,
      r,
      videoBlob: r.callbacks.onRecordingComplete.mock.calls[0][0]
    }
  }

  it('uses the mimeType prop as is', async () => {
    const { media, videoBlob } = await recordWith({ mimeType: 'video/mp4' })
    expect(media.lastRecorder.options).toEqual({ mimeType: 'video/mp4' })
    expect(media.MediaRecorder.isTypeSupported).not.toHaveBeenCalled()
    expect(videoBlob.type).toBe('video/mp4')
  })

  it('uses the first supported type from its list', async () => {
    const { media, videoBlob } = await recordWith(
      {},
      { supportedMimeTypes: ['video/mp4', 'video/webm;codecs=vp9'] }
    )
    expect(media.lastRecorder.options).toEqual({
      mimeType: 'video/webm;codecs=vp9'
    })
    expect(videoBlob.type).toBe('video/webm;codecs=vp9')
  })

  it('passes an empty mimeType when nothing in its list is supported', async () => {
    const { media } = await recordWith({}, { supportedMimeTypes: [] })
    expect(media.lastRecorder.options).toEqual({ mimeType: '' })
  })

  it('falls back to video/webm without MediaRecorder.isTypeSupported', async () => {
    const media = installFakeMedia()
    media.MediaRecorder.isTypeSupported = undefined
    const r = renderRecorder()
    await recordVideo(r, 500)
    expect(media.lastRecorder.options).toEqual({ mimeType: 'video/webm' })
  })

  it("uses the recorder's own mimeType for the final Blob", async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    media.lastRecorder.mimeType = 'video/x-matroska'
    await advance(500)
    await stopRecording(r)
    expect(r.callbacks.onRecordingComplete.mock.calls[0][0].type).toBe(
      'video/x-matroska'
    )
  })
})

describe('pausing and resuming', () => {
  it('pauses and resumes the recorder through the renderActions callbacks', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)

    await act(async () => r.actions().onPauseRecording())
    await advance(2000)
    await act(async () => r.actions().onResumeRecording())
    await advance(500)
    await stopRecording(r)

    expect(media.lastRecorder.calls).toEqual([
      ['start', 250],
      ['pause'],
      ['resume'],
      ['stop']
    ])
    expect(r.events).toEqual([
      'onTurnOnCamera',
      'onCameraOn',
      'onStartRecording',
      'onPauseRecording',
      'onResumeRecording',
      'onStopRecording',
      'onTurnOffCamera',
      'onRecordingComplete'
    ])
    // The WebM metadata gets the recorded time without the pause...
    expect(fixWebmDuration.mock.calls[0][1]).toBe(1500)
    // ...but onRecordingComplete's duration is wall-clock time.
    expect(r.callbacks.onRecordingComplete.mock.calls[0][3]).toBe(3500)
  })

  it.runIf(IS_LEGACY)('[known bug] counts the time before a pause twice when stopping while paused', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    await advance(2000)
    await stopRecording(r)

    // Should be 1000.
    expect(fixWebmDuration.mock.calls[0][1]).toBe(4000)
  })

  it.runIf(IS_LEGACY)('[known bug] keeps the timer running while paused', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    await advance(2000)
    expect(screen.getByText('3s')).toBeTruthy()
  })

  it.skipIf(IS_LEGACY)('writes only the recorded time when stopping while paused', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    await advance(2000)
    await stopRecording(r)

    expect(fixWebmDuration.mock.calls[0][1]).toBe(1000)
  })

  it.skipIf(IS_LEGACY)('ignores pausing twice and resuming while recording', async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onResumeRecording())
    await act(async () => r.actions().onPauseRecording())
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    await advance(1000)
    await act(async () => r.actions().onResumeRecording())
    await advance(500)
    await stopRecording(r)

    expect(media.lastRecorder.calls).toEqual([
      ['start', 250],
      ['pause'],
      ['resume'],
      ['stop']
    ])
    expect(fixWebmDuration.mock.calls[0][1]).toBe(1500)
  })

  it.skipIf(IS_LEGACY)('stops the timer while paused', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    expect(r.flags().isPaused).toBe(true)
    await advance(2000)
    expect(screen.getByText('1s')).toBeTruthy()

    await act(async () => r.actions().onResumeRecording())
    expect(r.flags().isPaused).toBe(false)
    await advance(1000)
    expect(screen.getByText('2s')).toBeTruthy()
  })

  it.skipIf(IS_LEGACY)('counts only recorded time toward timeLimit', async () => {
    const media = installFakeMedia()
    const r = renderRecorder({ timeLimit: 2000 })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await act(async () => r.actions().onPauseRecording())
    await advance(5000)
    expect(media.lastRecorder.state).toBe('paused')

    await act(async () => r.actions().onResumeRecording())
    await advance(999)
    expect(media.lastRecorder.state).toBe('recording')
    await advance(1)
    expect(media.lastRecorder.calls.at(-1)).toEqual(['stop'])
    expect(fixWebmDuration.mock.calls[0][1]).toBe(2000)
  })

  it('does not render pause or resume buttons by default', async () => {
    installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    expect(r.container.querySelectorAll('button')).toHaveLength(1)
  })
})

describe('recording errors', () => {
  it.runIf(IS_LEGACY)('fails when no data arrives within dataAvailableTimeout', async () => {
    const media = installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(499)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    await advance(1)

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('ReactVideoRecorderDataAvailableTimeoutError')
    expect(error.message).toBe(
      "Method mediaRecorder.ondataavailable wasn't called after 500ms"
    )
    expect(error.dataAvailableTimeout).toBe(500)
    expect(r.container.textContent).toContain('Oh snap!')
    expect(r.byQa('stop-recording')).toBeNull()
    expect(media.lastStream.isStopped).toBe(true)
    expect(r.events.slice(-2)).toEqual(['onError', 'onTurnOffCamera'])
    expect(takeConsole('error')).toEqual([['Captured error', error]])
  })

  it.skipIf(IS_LEGACY)('fails when no data arrives chunkSize + dataAvailableTimeout ms into the recording', async () => {
    const media = installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(749)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    await advance(1)

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('ReactVideoRecorderDataAvailableTimeoutError')
    expect(error.message).toBe(
      "Method mediaRecorder.ondataavailable wasn't called after 750ms"
    )
    expect(error.dataAvailableTimeout).toBe(750)
    expect(r.container.textContent).toContain('Oh snap!')
    expect(r.byQa('stop-recording')).toBeNull()
    expect(media.lastStream.isStopped).toBe(true)
    expect(r.events.slice(-2)).toEqual(['onError', 'onTurnOffCamera'])
    expect(takeConsole('error')).toEqual([['Captured error', error]])
  })

  it.skipIf(IS_LEGACY)('stops the MediaRecorder after a data timeout', async () => {
    const media = installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(500)
    await advance(1000)
    takeConsole('error')
    expect(media.lastRecorder.state).toBe('inactive')
    expect(r.callbacks.onError).toHaveBeenCalledTimes(1)
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
  })

  it.skipIf(IS_LEGACY)("stops the MediaRecorder after the recorder's error event", async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await act(async () => {
      media.lastRecorder.emitError()
    })
    await advance(1000)
    takeConsole('error')
    expect(media.lastRecorder.state).toBe('inactive')
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
  })

  it.runIf(IS_LEGACY)('[known bug] leaves the MediaRecorder running after a data timeout', async () => {
    const media = installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(500)
    takeConsole('error')
    expect(media.lastRecorder.state).toBe('recording')
  })

  it.runIf(IS_LEGACY)('honours a custom dataAvailableTimeout', async () => {
    installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder({ dataAvailableTimeout: 2000 })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1999)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    await advance(1)
    expect(r.callbacks.onError).toHaveBeenCalledTimes(1)
    takeConsole('error')
  })

  it.skipIf(IS_LEGACY)('honours a custom dataAvailableTimeout after the first chunk', async () => {
    installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder({ dataAvailableTimeout: 2000 })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(2249)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    await advance(1)
    expect(r.callbacks.onError).toHaveBeenCalledTimes(1)
    takeConsole('error')
  })

  it('skips the data check when dataAvailableTimeout is null', async () => {
    installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder({ dataAvailableTimeout: null })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(5000)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    expect(r.byQa('stop-recording')).not.toBeNull()
  })

  it('fails on stop when no data was recorded', async () => {
    const media = installFakeMedia({ recorderEmitsData: false })
    const r = renderRecorder({ dataAvailableTimeout: null })
    await turnOnCamera(r)
    await startRecording(r)
    await advance(1000)
    await stopRecording(r)

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('ReactVideoRecorderRecordedBlobsUnavailableError')
    expect(error.message).toBe("Couldn't get recordedBlobs")
    expect(error.event.type).toBe('stop')
    expect(r.callbacks.onRecordingComplete).not.toHaveBeenCalled()
    expect(r.container.textContent).toContain('Oh snap!')
    expect(media.lastStream.isStopped).toBe(true)
    expect(takeConsole('error')).toEqual([
      ["Couldn't get recordedBlobs", error.event],
      ['Captured error', error]
    ])
  })

  it('fails when a chunk has no data', async () => {
    const media = installFakeMedia()
    media.makeChunk = () => undefined
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    await advance(250)

    const [error] = r.callbacks.onError.mock.calls[0]
    expect(error.name).toBe('ReactVideoRecorderDataIssueError')
    expect(error.message).toBe("Couldn't get data from event")
    expect(error.event.type).toBe('dataavailable')
    expect(r.container.textContent).toContain('Oh snap!')
    expect(takeConsole('error')).toEqual([
      ["Couldn't get data from event", error.event],
      ['Captured error', error]
    ])
  })

  it('fails when the first 2 seconds of chunks are all empty', async () => {
    const media = installFakeMedia()
    media.makeChunk = (count, type) => new Blob([], { type })
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    // 16 chunks are kept; the check runs when the 17th arrives.
    await advance(16 * 250)
    expect(r.callbacks.onError).not.toHaveBeenCalled()
    await advance(250)
    expect(r.callbacks.onError.mock.calls[0][0].name).toBe(
      'ReactVideoRecorderDataIssueError'
    )
    takeConsole('error')
  })

  it("passes the recorder's error event straight to onError", async () => {
    const media = installFakeMedia()
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)
    let event
    await act(async () => {
      event = media.lastRecorder.emitError()
    })

    expect(r.callbacks.onError).toHaveBeenCalledWith(event)
    expect(r.container.textContent).toContain('Oh snap!')
    expect(takeConsole('error')).toEqual([['Captured error', event]])
  })

  it('reports a MediaRecorder that fails to start', async () => {
    const media = installFakeMedia()
    const createError = new Error('NotSupportedError')
    media.createRecorderError = createError
    const r = renderRecorder()
    await turnOnCamera(r)
    await startRecording(r)

    expect(r.callbacks.onError).toHaveBeenCalledWith(createError)
    expect(r.container.textContent).toContain('Oh snap!')
    expect(takeConsole('error')).toEqual([
      [
        "Couldn't create MediaRecorder",
        createError,
        { mimeType: 'video/webm;codecs="vp8,opus"' }
      ],
      ['Captured error', createError]
    ])
  })

  it.each([['onStopRecording'], ['onPauseRecording'], ['onResumeRecording']])(
    'fails on %s before a recording has started',
    async (callback) => {
      installFakeMedia()
      const r = renderRecorder()
      await turnOnCamera(r)
      await act(async () => r.actions()[callback]())

      const [error] = r.callbacks.onError.mock.calls[0]
      expect(error.name).toBe('ReactVideoRecorderMediaRecorderUnavailableError')
      expect(error.message).toBe("Couldn't get mediaRecorder")
      expect(r.events.slice(-3)).toEqual([
        callback,
        'onError',
        'onTurnOffCamera'
      ])
      takeConsole('error')
    }
  )
})
