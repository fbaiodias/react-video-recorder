import { useLayoutEffect } from 'react'
import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useVideoRecorder } from '../../src/use-video-recorder'
import { installFakeMedia, mediaError } from './fake-media'
import { takeConsole } from './console-capture'
import { advance } from './helpers'

// A minimal custom UI on top of the hook, like an app would build.
let controller
const CustomRecorder = (options) => {
  const recorder = useVideoRecorder(options)
  useLayoutEffect(() => {
    controller = recorder
  })
  const { status, state, setCameraVideo, setReplayVideo } = recorder
  return (
    <div>
      <p data-testid='status'>{status}</p>
      {status === 'replaying' ? (
        <video ref={setReplayVideo} src={state.videoUrl} />
      ) : (
        <video ref={setCameraVideo} />
      )}
    </div>
  )
}

const status = () => screen.getByTestId('status').textContent
const run = (fn) => act(async () => fn())

describe('useVideoRecorder', () => {
  it('reports its status through a recording', async () => {
    const media = installFakeMedia()
    const onRecordingComplete = () => {}
    render(
      <CustomRecorder
        countdownTime={1000}
        onRecordingComplete={onRecordingComplete}
      />
    )
    await advance(0)
    expect(status()).toBe('idle')

    await run(() => controller.turnOnCamera())
    expect(status()).toBe('connecting')
    expect(screen.getByTestId('status').nextSibling.srcObject).toBe(
      media.lastStream
    )
    await advance(200)
    expect(status()).toBe('ready')

    await run(() => controller.startRecording())
    expect(status()).toBe('countdown')
    await advance(1000)
    expect(status()).toBe('recording')

    await run(() => controller.pauseRecording())
    expect(status()).toBe('paused')
    expect(media.lastRecorder.state).toBe('paused')
    await run(() => controller.resumeRecording())
    expect(status()).toBe('recording')

    await advance(500)
    await run(() => controller.stopRecording())
    await advance(0)
    expect(status()).toBe('replaying')
    expect(controller.state.fixedVideoBlob).toBeInstanceOf(Blob)
    expect(screen.getByTestId('status').nextSibling.getAttribute('src')).toBe(
      controller.state.videoUrl
    )

    await run(() => controller.stopReplaying())
    expect(status()).toBe('idle')
  })

  it('is ready as soon as the stream arrives without a camera preview', async () => {
    installFakeMedia({ videoPlaysAfter: null })
    const NoPreview = () => {
      const { status, turnOnCamera } = useVideoRecorder()
      useLayoutEffect(() => {
        controller = { turnOnCamera }
      })
      return <p data-testid='status'>{status}</p>
    }
    render(<NoPreview />)
    await advance(0)
    await run(() => controller.turnOnCamera())
    expect(status()).toBe('ready')
  })

  it("reports 'error' with the error in state", async () => {
    const media = installFakeMedia()
    const error = mediaError('NotAllowedError')
    media.getUserMedia.mockImplementationOnce(() => Promise.reject(error))
    render(<CustomRecorder />)
    await advance(0)
    await run(() => controller.turnOnCamera())

    expect(status()).toBe('error')
    expect(controller.state.error).toBe(error)
    takeConsole('error')
  })

  it("reports 'unsupported' without MediaRecorder or a file input fallback", async () => {
    installFakeMedia({ mediaRecorder: false })
    render(<CustomRecorder />)
    await advance(0)
    expect(status()).toBe('unsupported')
  })

  it('keeps its functions stable across renders', async () => {
    installFakeMedia()
    render(<CustomRecorder />)
    const first = controller
    await advance(0)
    await run(() => controller.turnOnCamera())
    const functionNames = Object.keys(first).filter(
      (key) => typeof first[key] === 'function'
    )
    expect(
      functionNames.filter((key) => controller[key] !== first[key])
    ).toEqual([])
  })
})
