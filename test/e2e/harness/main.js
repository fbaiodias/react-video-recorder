import { createRoot } from 'react-dom/client'
import VideoRecorder from '../../../src'
import defaultRenderActions from '../../../src/defaults/render-actions'

// Renders <VideoRecorder> with props from the URL, e.g.
// /?props={"isOnInitially":true}&pauseControls=1, and records what the
// callbacks receive on window.__harness for the tests to read.
const params = new URLSearchParams(window.location.search)
const props = JSON.parse(params.get('props') || '{}')
const pauseControls = params.has('pauseControls')

const harness = (window.__harness = {
  events: [],
  recording: null,
  errors: []
})

const describeBlob = (blob) =>
  blob ? { size: blob.size, type: blob.type } : blob

const callbacks = {}
for (const name of [
  'onCameraOn',
  'onTurnOnCamera',
  'onSwitchCamera',
  'onTurnOffCamera',
  'onStartRecording',
  'onStopRecording',
  'onPauseRecording',
  'onResumeRecording',
  'onOpenVideoInput',
  'onStopReplaying'
]) {
  callbacks[name] = () => harness.events.push(name)
}

callbacks.onRecordingComplete = (...args) => {
  const [videoBlob, startedAt, thumbnail, duration, extension] = args
  harness.events.push('onRecordingComplete')
  harness.recording = {
    video: describeBlob(videoBlob),
    startedAt,
    thumbnail: describeBlob(thumbnail),
    duration,
    extension,
    argumentCount: args.length
  }
}

callbacks.onError = (error) => {
  harness.events.push('onError')
  harness.errors.push({
    name: error && error.name,
    message: error && error.message
  })
}

const renderActions = (args) => (
  <>
    {defaultRenderActions(args)}
    {pauseControls && args.isRecording && (
      <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
        <button
          type='button'
          data-qa='harness-pause'
          onClick={() => args.onPauseRecording()}
        >
          pause
        </button>
        <button
          type='button'
          data-qa='harness-resume'
          onClick={() => args.onResumeRecording()}
        >
          resume
        </button>
      </div>
    )}
  </>
)

createRoot(document.getElementById('root')).render(
  <VideoRecorder
    {...callbacks}
    renderActions={pauseControls ? renderActions : undefined}
    {...props}
  />
)
