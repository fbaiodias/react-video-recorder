export class ReactVideoRecorderDataIssueError extends Error {
  constructor (event) {
    super("Couldn't get data from event")
    this.name = 'ReactVideoRecorderDataIssueError'
    this.event = event
  }
}

export class ReactVideoRecorderRecordedBlobsUnavailableError extends Error {
  constructor (event) {
    super("Couldn't get recordedBlobs")
    this.name = 'ReactVideoRecorderRecordedBlobsUnavailableError'
    this.event = event
  }
}

export class ReactVideoRecorderDataAvailableTimeoutError extends Error {
  constructor (dataAvailableTimeout) {
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
