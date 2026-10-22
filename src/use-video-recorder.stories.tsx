import type { Meta, StoryObj } from '@storybook/react-vite'
import { useVideoRecorder } from './use-video-recorder.ts'
import type { UseVideoRecorderOptions } from './types.ts'

// A UI built from scratch on the hook, without any of the default views.
const CustomRecorder = (options: UseVideoRecorderOptions) => {
  // Destructured, as the React Compiler's lint rules expect: the setters
  // are callback refs.
  const {
    status,
    state,
    setCameraVideo,
    setReplayVideo,
    turnOnCamera,
    turnOffCamera,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    stopReplaying
  } = useVideoRecorder(options)

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <p>
        Status: <strong>{status}</strong>
      </p>

      {status === 'replaying'
        ? (
            <video
              ref={setReplayVideo}
              src={state.videoUrl}
              controls
              playsInline
              style={{ width: 480 }}
            />
          )
        : (
            <video
              ref={setCameraVideo}
              autoPlay
              muted
              playsInline
              style={{ width: 480, background: '#000', transform: 'scaleX(-1)' }}
            />
          )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {status === 'idle' && (
          <button type='button' onClick={() => turnOnCamera()}>
            Turn on camera
          </button>
        )}
        {status === 'ready' && (
          <>
            <button type='button' onClick={startRecording}>
              Record
            </button>
            <button type='button' onClick={turnOffCamera}>
              Turn off camera
            </button>
          </>
        )}
        {status === 'countdown' && <span>Get ready…</span>}
        {status === 'recording' && (
          <>
            <button type='button' onClick={pauseRecording}>
              Pause
            </button>
            <button type='button' onClick={stopRecording}>
              Stop
            </button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button type='button' onClick={resumeRecording}>
              Resume
            </button>
            <button type='button' onClick={stopRecording}>
              Stop
            </button>
          </>
        )}
        {status === 'replaying' && (
          <button type='button' onClick={stopReplaying}>
            Record another
          </button>
        )}
        {status === 'error' && <span>Something went wrong: {String(state.error)}</span>}
      </div>
    </div>
  )
}

const meta = {
  title: 'useVideoRecorder',
  component: CustomRecorder,
  args: { countdownTime: 1000 }
} satisfies Meta<typeof CustomRecorder>

export default meta

export const CustomUI: StoryObj<typeof meta> = {
  name: 'custom UI'
}
