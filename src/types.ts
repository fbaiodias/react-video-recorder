import type { ReactElement, ReactNode } from 'react'
import type {
  RenderActionsProps,
  Translate
} from './defaults/render-actions.tsx'
import type { VideoRecorderErrorCode } from './custom-errors.ts'

export type { RenderActionsProps, Translate, VideoRecorderErrorCode }

/** What onError and renderErrorView receive: an Error, or MediaRecorder's error event */
export type VideoRecorderError = Error | Event

export interface VideoRecorderCallbacks {
  onCameraOn?: () => void
  onTurnOnCamera?: () => void
  onSwitchCamera?: () => void
  onTurnOffCamera?: () => void
  onStartRecording?: () => void
  onStopRecording?: () => void
  onPauseRecording?: () => void
  onResumeRecording?: () => void
  /**
   * Called with the recorded (or picked) video. `duration` is in ms; it and
   * the thumbnail are null when a picked file can't be read in time.
   */
  onRecordingComplete?: (
    videoBlob: Blob,
    startedAt: number,
    thumbnailBlob: Blob | null,
    duration: number | null,
    extension?: string
  ) => void
  onOpenVideoInput?: () => void
  onStopReplaying?: () => void
  onError?: (err: VideoRecorderError) => void
}

/** Options for useVideoRecorder(): the props that drive behavior, not looks */
export interface UseVideoRecorderOptions extends VideoRecorderCallbacks {
  /** Whether or not to start the camera initially */
  isOnInitially?: boolean
  /** Pass this if you want to force a specific mime-type for the video */
  mimeType?: string
  /** How much time to wait until it starts recording (in ms). Default: 3000 */
  countdownTime?: number
  /** Use this if you want to set a time limit for the video (in ms) */
  timeLimit?: number
  /** Whether the replay video shows its own controls (clicking it then doesn't call play()) */
  showReplayControls?: boolean
  /** Use this to turn off autoplay and looping of the replay video. It is recommended to also showReplayControls in order to play */
  replayVideoAutoplayAndLoopOff?: boolean
  /** Use this if you want to customize the constraints passed to getUserMedia(). Default: { audio: true, video: true } */
  constraints?: MediaStreamConstraints
  /** How often MediaRecorder hands over recorded data (in ms). Default: 250 */
  chunkSize?: number
  /**
   * Fail when no data has arrived this long (in ms) after the first chunk was
   * due, i.e. chunkSize + dataAvailableTimeout ms into the recording. null
   * skips the check. Default: 500
   */
  dataAvailableTimeout?: number | null
  /** Use a file input instead of recording inline */
  useVideoInput?: boolean
}

export interface VideoRecorderProps extends UseVideoRecorderOptions {
  /** Whether or not to display the camera mirrored. Cameras that report facingMode 'environment' never are. Default: true */
  isFlipped?: boolean
  /** Use this to configure the replaying video element's controlslist attribute */
  videoControlsList?: string
  /** Use this to disable picture in picture mode on the replaying video element */
  disablePictureInPicture?: boolean

  renderDisconnectedView?: () => ReactNode
  renderLoadingView?: () => ReactNode
  renderVideoInputView?: (props: {
    videoInput: ReactElement | null
  }) => ReactNode
  renderUnsupportedView?: () => ReactNode
  renderErrorView?: (props: {
    error: VideoRecorderError | null
    /** What kind of error it is, e.g. 'permission-denied' */
    errorCode: VideoRecorderErrorCode | null
    t: Translate
  }) => ReactNode
  renderActions?: (props: RenderActionsProps) => ReactNode

  cameraViewClassName?: string
  videoClassName?: string
  wrapperClassName?: string

  /** Use this to localize the texts */
  t?: Translate
}

export interface VideoRecorderState {
  /** null until the component has mounted */
  isInlineRecordingSupported: boolean | null
  /** null until the component has mounted */
  isVideoInputSupported: boolean | null
  isConnecting: boolean
  isCameraOn: boolean
  /** Turns true once the camera video first plays (or 1s after the stream arrives) */
  streamIsReady: boolean
  /** undefined until the first recording starts */
  isRunningCountdown?: boolean
  isRecording: boolean
  isPaused: boolean
  isReplayingVideo: boolean
  isReplayVideoMuted: boolean
  thereWasAnError: boolean
  error: VideoRecorderError | null
  /** What kind of error it is, e.g. 'permission-denied' (see getErrorCode) */
  errorCode: VideoRecorderErrorCode | null
  /**
   * Camera access as the browser's Permissions API reports it, kept up to
   * date. 'unknown' where the API can't tell (e.g. some browsers don't
   * support querying the camera).
   */
  permission: VideoRecorderPermission
  stream: MediaStream | undefined
  /** The camera's facingMode, when the browser reports it ('user', 'environment', ...) */
  facingMode?: string
  currentDeviceId: string | null
  availableDeviceIds: string[]
  /**
   * The cameras, for a camera picker. Browsers only give labels (and real
   * ids) once camera access is granted, so this fills in when the camera
   * turns on, and updates when cameras are plugged in or out.
   */
  devices: VideoRecorderDevice[]
  /** Object URL of the video being replayed */
  videoUrl?: string
  /** The picked file, when replaying one */
  videoBlob?: Blob
  /** The recording, when replaying one */
  fixedVideoBlob?: Blob
}

export type VideoRecorderPermission =
  'unknown' | 'prompt' | 'granted' | 'denied'

export interface VideoRecorderDevice {
  deviceId: string
  /** e.g. "FaceTime HD Camera". Empty before camera access is granted. */
  label: string
}

export type VideoRecorderStatus =
  | 'initializing'
  | 'unsupported'
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'replaying'
  | 'error'

/** Everything useVideoRecorder() returns */
export interface VideoRecorderController {
  state: VideoRecorderState
  status: VideoRecorderStatus

  turnOnCamera: (deviceId?: string | null) => void
  turnOffCamera: () => void
  /** Turns on the next camera in state.devices */
  switchCamera: () => void
  /** Turns on this camera from state.devices */
  selectDevice: (deviceId: string) => void
  /** Runs the countdown, then records */
  startRecording: () => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  /** Opens the file input (needs setVideoInput on an <input type="file">) */
  openVideoInput: () => void
  /** Leaves the replay: back to the camera (with isOnInitially) or the start */
  stopReplaying: () => void

  /** Attach to the <video> that shows the camera */
  setCameraVideo: (element: HTMLVideoElement | null) => void
  /** Attach to the <video> that replays the recording */
  setReplayVideo: (element: HTMLVideoElement | null) => void
  /** Attach to the <input type="file"> used for picking or capturing a video */
  setVideoInput: (element: HTMLInputElement | null) => void
  /** The file input's onChange handler */
  handleVideoInputChange: (
    event: Event | { target: EventTarget | null }
  ) => void
  /** The replay video's onClick handler: toggles mute (and plays if paused) */
  handleReplayVideoClick: () => void
}

/**
 * What a ref to <VideoRecorder> exposes. These are the method names the 3.x
 * class component had, kept so apps that called them through a ref keep
 * working.
 */
export interface VideoRecorderHandle {
  turnOnCamera: (deviceId?: string | null) => void
  turnOffCamera: () => void
  handleSwitchCamera: () => void
  selectDevice: (deviceId: string) => void
  handleStartRecording: () => void
  handleStopRecording: () => void
  handlePauseRecording: () => void
  handleResumeRecording: () => void
  handleOpenVideoInput: () => void
  handleStopReplaying: () => void
  readonly state: VideoRecorderState
}
