export class ReactVideoRecorderDataIssueError extends Error {
  declare event: Event

  constructor(event: Event) {
    super("Couldn't get data from event")
    this.name = 'ReactVideoRecorderDataIssueError'
    this.event = event
  }
}

export class ReactVideoRecorderRecordedBlobsUnavailableError extends Error {
  declare event: Event

  constructor(event: Event) {
    super("Couldn't get recordedBlobs")
    this.name = 'ReactVideoRecorderRecordedBlobsUnavailableError'
    this.event = event
  }
}

export class ReactVideoRecorderDataAvailableTimeoutError extends Error {
  declare dataAvailableTimeout: number

  constructor(dataAvailableTimeout: number) {
    super(
      `Method mediaRecorder.ondataavailable wasn't called after ${dataAvailableTimeout}ms`
    )
    this.name = 'ReactVideoRecorderDataAvailableTimeoutError'
    this.dataAvailableTimeout = dataAvailableTimeout
  }
}

export class ReactVideoRecorderMediaRecorderUnavailableError extends Error {
  constructor() {
    super("Couldn't get mediaRecorder")
    this.name = 'ReactVideoRecorderMediaRecorderUnavailableError'
  }
}

export class ReactVideoRecorderDeviceUnavailableError extends Error {
  constructor() {
    super("Couldn't get selected device")
    this.name = 'ReactVideoRecorderDeviceUnavailableError'
  }
}

/** What kind of problem an error from the recorder is about */
export type VideoRecorderErrorCode =
  | 'permission-denied'
  | 'no-camera'
  | 'camera-in-use'
  | 'no-data'
  | 'recorder-failed'
  | 'unknown'

const ERROR_CODES: Record<string, VideoRecorderErrorCode> = {
  // getUserMedia
  NotAllowedError: 'permission-denied',
  PermissionDeniedError: 'permission-denied',
  SecurityError: 'permission-denied',
  NotFoundError: 'no-camera',
  DevicesNotFoundError: 'no-camera',
  OverconstrainedError: 'no-camera',
  ReactVideoRecorderDeviceUnavailableError: 'no-camera',
  NotReadableError: 'camera-in-use',
  TrackStartError: 'camera-in-use',
  AbortError: 'camera-in-use',
  // recording
  ReactVideoRecorderDataAvailableTimeoutError: 'no-data',
  ReactVideoRecorderDataIssueError: 'no-data',
  ReactVideoRecorderRecordedBlobsUnavailableError: 'no-data',
  ReactVideoRecorderMediaRecorderUnavailableError: 'recorder-failed',
  NotSupportedError: 'recorder-failed',
  InvalidStateError: 'recorder-failed'
}

/**
 * Classifies what onError receives: an Error or DOMException (by its name),
 * or the MediaRecorder's error event.
 */
export function getErrorCode(error: unknown): VideoRecorderErrorCode {
  if (typeof Event !== 'undefined' && error instanceof Event) {
    return 'recorder-failed'
  }
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String(error.name)
      : ''
  return ERROR_CODES[name] ?? 'unknown'
}
