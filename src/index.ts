export {
  default,
  // Named exports too. ReactVideoRecorder matches the old
  // @types/react-video-recorder typings.
  default as VideoRecorder,
  default as ReactVideoRecorder
} from './video-recorder.tsx'
export { useVideoRecorder } from './use-video-recorder.ts'
export {
  ReactVideoRecorderDataIssueError,
  ReactVideoRecorderRecordedBlobsUnavailableError,
  ReactVideoRecorderDataAvailableTimeoutError,
  ReactVideoRecorderMediaRecorderUnavailableError,
  ReactVideoRecorderDeviceUnavailableError
} from './custom-errors.ts'
export type {
  RenderActionsProps,
  Translate,
  UseVideoRecorderOptions,
  VideoRecorderCallbacks,
  VideoRecorderController,
  VideoRecorderError,
  VideoRecorderHandle,
  VideoRecorderProps,
  VideoRecorderState,
  VideoRecorderStatus
} from './types.ts'
