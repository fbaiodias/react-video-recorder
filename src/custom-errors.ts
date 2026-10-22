export class ReactVideoRecorderDataIssueError extends Error {
  declare event: Event

  constructor (event: Event) {
    super("Couldn't get data from event")
    this.name = 'ReactVideoRecorderDataIssueError'
    this.event = event
  }
}

export class ReactVideoRecorderRecordedBlobsUnavailableError extends Error {
  declare event: Event

  constructor (event: Event) {
    super("Couldn't get recordedBlobs")
    this.name = 'ReactVideoRecorderRecordedBlobsUnavailableError'
    this.event = event
  }
}

export class ReactVideoRecorderDataAvailableTimeoutError extends Error {
  declare dataAvailableTimeout: number

  constructor (dataAvailableTimeout: number) {
    super(
      `Method mediaRecorder.ondataavailable wasn't called after ${dataAvailableTimeout}ms`
    )
    this.name = 'ReactVideoRecorderDataAvailableTimeoutError'
    this.dataAvailableTimeout = dataAvailableTimeout
  }
}

export class ReactVideoRecorderMediaRecorderUnavailableError extends Error {
  constructor () {
    super("Couldn't get mediaRecorder")
    this.name = 'ReactVideoRecorderMediaRecorderUnavailableError'
  }
}

export class ReactVideoRecorderDeviceUnavailableError extends Error {
  constructor () {
    super("Couldn't get selected device")
    this.name = 'ReactVideoRecorderDeviceUnavailableError'
  }
}
