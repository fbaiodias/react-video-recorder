import { act, fireEvent, render } from '@testing-library/react'
import { vi } from 'vitest'
import HooksVideoRecorder from '../../src/video-recorder'
import LegacyVideoRecorder from '../../src/video-recorder.legacy'
import defaultRenderActions from '../../src/defaults/render-actions'

// The suite runs twice (see vitest.config.mjs): against the hooks rewrite and
// against the original class, which stays until 4.0.0 as the reference.
export const IS_LEGACY = process.env.RVR_IMPLEMENTATION === 'legacy'
const VideoRecorder = IS_LEGACY ? LegacyVideoRecorder : HooksVideoRecorder

export const CALLBACK_PROPS = [
  'onCameraOn',
  'onTurnOnCamera',
  'onSwitchCamera',
  'onTurnOffCamera',
  'onStartRecording',
  'onStopRecording',
  'onPauseRecording',
  'onResumeRecording',
  'onRecordingComplete',
  'onOpenVideoInput',
  'onStopReplaying',
  'onError'
]

// React only re-renders when an act() scope ends, and class components read
// this.state from the last render. Advancing a long stretch in one act() would
// fire an interval several times against stale state (the Timer would count
// 1s per call), so time moves in short slices, each in its own act().
const ADVANCE_STEP_MS = 50

// Runs due timers and the promise callbacks they trigger.
export async function advance (ms = 0) {
  let remaining = ms
  do {
    const step = Math.min(remaining, ADVANCE_STEP_MS)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(step)
    })
    remaining -= step
  } while (remaining > 0)
}

export async function click (element) {
  if (!element) throw new Error('Tried to click a missing element')
  fireEvent.click(element)
  await advance(0)
}

// The non-function values of a renderActions call, i.e. the state it exposes.
export function actionFlags (args) {
  return Object.fromEntries(
    Object.entries(args)
      .filter(([, value]) => typeof value !== 'function')
      .sort(([a], [b]) => a.localeCompare(b))
  )
}

export function actionCallbackNames (args) {
  return Object.keys(args)
    .filter((key) => typeof args[key] === 'function')
    .sort()
}

export function renderRecorder (props = {}, options = {}) {
  const events = []
  const callbacks = {}
  for (const name of CALLBACK_PROPS) {
    callbacks[name] = vi.fn(() => {
      events.push(name)
    })
  }
  const renderActions = vi.fn(defaultRenderActions)

  const element = (nextProps = {}) => (
    <VideoRecorder
      {...callbacks}
      renderActions={renderActions}
      {...props}
      {...nextProps}
    />
  )
  const utils = render(element(), options)

  return {
    ...utils,
    events,
    callbacks,
    renderActions,
    rerenderWith: (nextProps) => utils.rerender(element(nextProps)),
    actions: () => renderActions.mock.lastCall[0],
    flags: () => actionFlags(renderActions.mock.lastCall[0]),
    byQa: (qa) => utils.container.querySelector(`[data-qa="${qa}"]`),
    video: () => utils.container.querySelector('video'),
    fileInput: () => utils.container.querySelector('input[type="file"]')
  }
}

// Flow shortcuts. Each one waits for the state the user would see next.
export async function turnOnCamera (recorder) {
  await click(recorder.byQa('turn-on-camera'))
  // The record button only shows up 200ms after the stream arrives.
  await advance(200)
}

export async function startRecording (recorder, countdownTime = 3000) {
  await click(recorder.byQa('start-recording'))
  await advance(countdownTime)
}

export async function stopRecording (recorder) {
  await click(recorder.byQa('stop-recording'))
  await advance(0)
}

export async function recordVideo (recorder, ms = 1000) {
  await turnOnCamera(recorder)
  await startRecording(recorder)
  await advance(ms)
  await stopRecording(recorder)
}
