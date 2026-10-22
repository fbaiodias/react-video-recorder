# react-video-recorder

A React component (and hook) that records video from the user's camera in the
browser, shows a countdown, a timer and a replay, and hands you the recording
as a `Blob`. Where inline recording isn't available (older iOS), it falls back
to the device's native camera through a file input.

See the [Storybook](https://react-video-recorder.vercel.app/) for demos.

## Installation

```sh
npm install react-video-recorder
# or
pnpm add react-video-recorder
# or
yarn add react-video-recorder
```

It needs `react` and `react-dom` 18 or 19. TypeScript types are included.

## Usage

```jsx
import VideoRecorder from 'react-video-recorder'

const App = () => (
  <VideoRecorder
    onRecordingComplete={(videoBlob, startedAt, thumbnailBlob, duration) => {
      // Upload videoBlob, show the thumbnail, ...
    }}
  />
)
```

`VideoRecorder` is also available as a named export, as is
`ReactVideoRecorder`.

### Props

| Prop                                                        | Default                        |                                                                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOnInitially`                                             | `false`                        | Turn the camera on (or open the file picker) right away.                                                                                                                                  |
| `isFlipped`                                                 | `true`                         | Show the camera mirrored. Cameras that report `facingMode: 'environment'` (a phone's back camera) never are.                                                                              |
| `countdownTime`                                             | `3000`                         | Countdown before recording starts, in ms.                                                                                                                                                 |
| `timeLimit`                                                 |                                | Stop recording after this many ms of recorded time.                                                                                                                                       |
| `mimeType`                                                  |                                | Force a mime type. By default, the first one the browser supports out of `video/webm;codecs="vp8,opus"`, `video/webm;codecs=h264`, `video/webm;codecs=vp9`, `video/webm` and `video/mp4`. |
| `constraints`                                               | `{ audio: true, video: true }` | Passed to [`getUserMedia()`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia), e.g. `{ audio: true, video: { facingMode: 'environment', width: 1280 } }`.            |
| `chunkSize`                                                 | `250`                          | How often the browser hands over recorded data, in ms.                                                                                                                                    |
| `dataAvailableTimeout`                                      | `500`                          | Fail with `ReactVideoRecorderDataAvailableTimeoutError` when no data has arrived this many ms after the first chunk was due. `null` turns the check off.                                  |
| `useVideoInput`                                             | `false`                        | Use a file input (pick or capture a video) instead of recording inline.                                                                                                                   |
| `showReplayControls`                                        | `false`                        | Show the browser's controls on the replay.                                                                                                                                                |
| `replayVideoAutoplayAndLoopOff`                             | `false`                        | Don't autoplay and loop the replay (best combined with `showReplayControls`).                                                                                                             |
| `videoControlsList`                                         |                                | The replay's [`controlslist`](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/controlsList), e.g. `'nodownload'`.                                                             |
| `disablePictureInPicture`                                   | `false`                        | Disable picture-in-picture on the replay.                                                                                                                                                 |
| `wrapperClassName`, `cameraViewClassName`, `videoClassName` |                                | Extra class names for the outer element, the camera/replay view and the `<video>`.                                                                                                        |
| `t`                                                         | `(text) => text`               | Translate the default UI's texts.                                                                                                                                                         |
| `render*`, `renderActions`                                  |                                | Replace parts of the UI, see below.                                                                                                                                                       |

### Callbacks

- `onRecordingComplete(videoBlob, startedAt, thumbnailBlob, duration, extension)`:
  the recorded (or picked) video. `startedAt` is a timestamp in ms, `duration`
  is in ms of wall-clock time (pauses included). For a picked file,
  `thumbnailBlob` and `duration` are `null` when the file couldn't be read in
  time, and `extension` is `'mov'` for QuickTime files.
- `onError(error)`: an `Error` (see [errors](#errors)), a `DOMException` from
  the browser (e.g. `NotAllowedError` when camera access is denied), or the
  MediaRecorder's `error` event. The error view is shown.
- `onTurnOnCamera`, `onCameraOn` (the stream arrived), `onTurnOffCamera`,
  `onSwitchCamera`, `onStartRecording` (the countdown starts),
  `onStopRecording`, `onPauseRecording`, `onResumeRecording`,
  `onOpenVideoInput`, `onStopReplaying`.

### Customizing the UI

Each view can be replaced:

- `renderDisconnectedView()`: before the camera is on.
- `renderLoadingView()`: while the camera starts.
- `renderErrorView({ error })`
- `renderUnsupportedView()`: the browser can't record video.
- `renderVideoInputView({ videoInput })`: the file input fallback. Render
  `videoInput`, a hidden `<input type="file">`.

`renderActions(props)` draws everything on top of the views: the buttons, the
countdown and the timer. It receives the recorder's state (`isCameraOn`,
`streamIsReady`, `isConnecting`, `isRunningCountdown`, `isRecording`,
`isPaused`, `isReplayingVideo`, `thereWasAnError`, ...), some props
(`countdownTime`, `timeLimit`, `useVideoInput`, `t`, ...) and the actions:
`onTurnOnCamera`, `onTurnOffCamera`, `onSwitchCamera`, `onStartRecording`,
`onStopRecording`, `onPauseRecording`, `onResumeRecording`,
`onOpenVideoInput` and `onStopReplaying`. The type is `RenderActionsProps`.

The default implementations can be reused:

```js
import renderActions from 'react-video-recorder/lib/defaults/render-actions'
import Button from 'react-video-recorder/lib/defaults/button'
import Timer from 'react-video-recorder/lib/defaults/timer'
import Countdown from 'react-video-recorder/lib/defaults/countdown'
```

### Styling

The default UI uses plain CSS classes starting with `rvr-` (`rvr-wrapper`,
`rvr-video`, `rvr-button`, `rvr-record-button`, `rvr-timer`, ...). The styles
are added to the page on first render, before any other stylesheet, so your
own rules with the same specificity win.

If your Content-Security-Policy doesn't allow inline styles, load the
stylesheet yourself:

```js
import 'react-video-recorder/styles.css'
```

### Building your own UI with `useVideoRecorder`

The hook has all the recording logic and no UI:

```jsx
import { useVideoRecorder } from 'react-video-recorder'

const Recorder = () => {
  const {
    status, // 'idle', 'connecting', 'ready', 'countdown', 'recording', 'paused', 'replaying', 'error', ...
    state, // e.g. state.videoUrl, state.error, state.availableDeviceIds
    setCameraVideo,
    setReplayVideo,
    turnOnCamera,
    startRecording,
    stopRecording,
    stopReplaying
  } = useVideoRecorder({
    countdownTime: 0,
    onRecordingComplete: (videoBlob) => upload(videoBlob)
  })

  return (
    <div>
      {status === 'replaying' ? (
        <video ref={setReplayVideo} src={state.videoUrl} controls />
      ) : (
        <video ref={setCameraVideo} autoPlay muted playsInline />
      )}

      {status === 'idle' && (
        <button onClick={() => turnOnCamera()}>Turn on camera</button>
      )}
      {status === 'ready' && <button onClick={startRecording}>Record</button>}
      {status === 'recording' && <button onClick={stopRecording}>Stop</button>}
      {status === 'replaying' && (
        <button onClick={stopReplaying}>Record again</button>
      )}
    </div>
  )
}
```

It takes the same options and callbacks as the component's behavior props
(everything but the `render*`, class name, `t`, `isFlipped` and replay
attribute props). Besides the actions above it returns `turnOffCamera`,
`switchCamera`, `pauseRecording`, `resumeRecording`, `openVideoInput`, and,
for a file input fallback, `setVideoInput` and `handleVideoInputChange`.
Destructure the result: the React Compiler's lint rules treat an object
holding callback refs as a ref.

### Ref

A ref to `<VideoRecorder>` has the actions under their 3.x names:
`turnOnCamera`, `turnOffCamera`, `handleSwitchCamera`, `handleStartRecording`,
`handleStopRecording`, `handlePauseRecording`, `handleResumeRecording`,
`handleOpenVideoInput` and `handleStopReplaying`, plus the current `state`.

### Errors

These are exported, and `onError` can receive them (check `error.name`):

- `ReactVideoRecorderDataAvailableTimeoutError`: no data arrived in time
  (see `dataAvailableTimeout`).
- `ReactVideoRecorderDataIssueError`: the recorder handed over empty data.
- `ReactVideoRecorderRecordedBlobsUnavailableError`: the recording stopped
  without any data.
- `ReactVideoRecorderMediaRecorderUnavailableError`: stop, pause or resume
  without a recording.
- `ReactVideoRecorderDeviceUnavailableError`: the camera to switch to is gone.

## Upgrading from 3.x

The props, callbacks, `renderActions` arguments, default UI and import paths
(including `react-video-recorder/lib/defaults/*`) are the same. What changed:

- **React 18 or newer.** `prop-types` and `styled-components` are no longer
  needed.
- **Built-in types.** Uninstall `@types/react-video-recorder`.
- **Styles.** The default UI is plain CSS and looks the same, but the
  generated `sc-*` class names are gone: target the `rvr-*` classes or the
  `*ClassName` props. The default `Button` takes `color` and `backgroundColor`
  as before, but not styled-components' `as` prop.
- **Function component.** A ref exposes the actions and `state` (see
  [Ref](#ref)), not other class internals, and `VideoRecorder.defaultProps` is
  gone.
- **Package format.** `lib/` has CommonJS and `lib/esm/` ES modules, both
  ES2019 instead of ES5, and only the paths in the `exports` map can be
  imported (every 3.x path is in it).
- **Cameras.** `constraints` are passed to `getUserMedia()` as given; 3.x
  forced the first camera's `deviceId`, which overrode `facingMode`.
  Switching cameras asks for the next camera's `deviceId`. Rear cameras
  aren't mirrored.
- **Timing.** `dataAvailableTimeout` now counts from when the first chunk is
  due, so the error comes `chunkSize` ms later (750ms by default). With a
  `timeLimit`, paused time no longer counts.
- **Fixes.** It works under `React.StrictMode`, cleans up the camera and
  recorder on unmount, stops recording on errors, shows the new camera after
  switching, pauses the timer, and doesn't require `onRecordingComplete`.

## Development

Requires Node.js 22.12 or newer and [pnpm](https://pnpm.io/installation). The
version in `packageManager` is downloaded automatically.

```sh
pnpm install
pnpm start         # Storybook on http://localhost:6006
```

### Checks

```sh
pnpm lint            # Oxlint (with type information) and Prettier's check
pnpm format          # format everything with Prettier
pnpm typecheck       # TypeScript
pnpm test            # unit tests (jsdom with a fake camera) and checks of the built package
pnpm check:package   # publint and are-the-types-wrong on the packed tarball
pnpm test:e2e        # real recordings in Chromium and Firefox with fake cameras
pnpm test:visual     # screenshots of every UI state (macOS baselines, not run in CI)
```

The browser tests need Playwright's browsers once:
`pnpm exec playwright install chromium firefox`.

`pnpm build` compiles `src/` to `lib/` (CommonJS) and `lib/esm/` (ES modules)
with `tsc`.

### Committing

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
semantic-release publishes from `main` and prereleases from `next`. Husky lints
and runs the unit tests before each commit.
