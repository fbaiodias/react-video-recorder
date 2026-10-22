import React, { Component } from 'react'
import type { ChangeEvent, ReactElement, ReactNode } from 'react'
import PropTypes from 'prop-types'
import merge from 'lodash.merge'
import styled, { css } from 'styled-components'
import fixWebmDuration from 'fix-webm-duration'

import UnsupportedView from './defaults/unsupported-view.tsx'
import ErrorView from './defaults/error-view.tsx'
import DisconnectedView from './defaults/disconnected-view.tsx'
import LoadingView from './defaults/loading-view.tsx'
import SwitchCameraView from './defaults/switch-camera-view.tsx'
import renderActions from './defaults/render-actions.tsx'
import type { RenderActionsProps, Translate } from './defaults/render-actions.tsx'
import getVideoInfo, { captureThumb } from './get-video-info.ts'
import {
  ReactVideoRecorderDataIssueError,
  ReactVideoRecorderRecordedBlobsUnavailableError,
  ReactVideoRecorderDataAvailableTimeoutError,
  ReactVideoRecorderMediaRecorderUnavailableError,
  ReactVideoRecorderDeviceUnavailableError
} from './custom-errors.ts'

const MIME_TYPES = [
  'video/webm;codecs="vp8,opus"',
  'video/webm;codecs=h264',
  'video/webm;codecs=vp9',
  'video/webm',
  'video/mp4'
]

const CONSTRAINTS = {
  audio: true,
  video: true
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 300px;
  background-color: #000;
  color: white;
  box-sizing: border-box;
  * {
    box-sizing: inherit;
  }
`

const CameraView = styled.div`
  width: 100%;
  height: 100%;
`

const Video = styled.video<{ isFlipped?: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 100%;
  min-width: 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  ${(props) =>
    props.isFlipped &&
    css`
      transform: translate(-50%, -50%) scaleX(-1);
    `};
  ${(props) =>
    props.onClick &&
    css`
      cursor: pointer;
    `};
`

/** What onError and renderErrorView receive: an Error, or MediaRecorder's error event */
export type VideoRecorderError = Error | Event

export interface VideoRecorderProps {
  /** Whether or not to start the camera initially */
  isOnInitially?: boolean
  /** Whether or not to display the video flipped (makes sense for user facing camera) */
  isFlipped?: boolean
  /** Pass this if you want to force a specific mime-type for the video */
  mimeType?: string
  /** How much time to wait until it starts recording (in ms) */
  countdownTime?: number
  /** Use this if you want to set a time limit for the video (in ms) */
  timeLimit?: number
  /** Use this if you want to show play/pause/etc. controls on the replay video */
  showReplayControls?: boolean
  /** Use this to turn off autoplay and looping of the replay video. It is recommended to also showReplayControls in order to play */
  replayVideoAutoplayAndLoopOff?: boolean
  /** Use this if you want to customize the constraints passed to getUserMedia() */
  constraints?: MediaStreamConstraints
  /** How often MediaRecorder hands over recorded data (in ms) */
  chunkSize?: number
  /** Fail when no data arrives this long after recording starts (in ms), or null to skip the check */
  dataAvailableTimeout?: number | null
  /** Use a file input instead of recording inline */
  useVideoInput?: boolean
  /** Use this to configure the replaying video element's controlslist attribute */
  videoControlsList?: string
  /** Use this to disable picture in picture mode on the replaying video element */
  disablePictureInPicture?: boolean

  renderDisconnectedView?: () => ReactNode
  renderLoadingView?: () => ReactNode
  renderVideoInputView?: (props: { videoInput: ReactElement | null }) => ReactNode
  renderUnsupportedView?: () => ReactNode
  renderErrorView?: (props: { error: VideoRecorderError | null }) => ReactNode
  renderActions?: (props: RenderActionsProps) => ReactNode

  cameraViewClassName?: string
  videoClassName?: string
  wrapperClassName?: string

  /** Use this to localize the texts */
  t?: Translate

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

type DefaultedProps =
  | 'renderUnsupportedView'
  | 'renderErrorView'
  | 'renderVideoInputView'
  | 'renderDisconnectedView'
  | 'renderLoadingView'
  | 't'
  | 'renderActions'
  | 'isFlipped'
  | 'countdownTime'
  | 'constraints'
  | 'chunkSize'
  | 'dataAvailableTimeout'

// Inside the class, props that have defaults are always set.
type Props = VideoRecorderProps &
  Required<Pick<VideoRecorderProps, DefaultedProps>>

interface State {
  isRecording: boolean
  isCameraOn: boolean
  isConnecting: boolean
  isReplayingVideo: boolean
  isReplayVideoMuted: boolean
  thereWasAnError: boolean
  error: VideoRecorderError | null
  streamIsReady: boolean
  isInlineRecordingSupported: boolean | null
  isVideoInputSupported: boolean | null
  stream: MediaStream | undefined
  currentDeviceId: string | null
  availableDeviceIds: string[]
  isRunningCountdown?: boolean
  videoUrl?: string
  videoBlob?: Blob
  fixedVideoBlob?: Blob
}

export default class VideoRecorder extends Component<Props, State> {
  static propTypes = {
    /** Whether or not to start the camera initially */
    isOnInitially: PropTypes.bool,
    /** Whether or not to display the video flipped (makes sense for user facing camera) */
    isFlipped: PropTypes.bool,
    /** Pass this if you want to force a specific mime-type for the video */
    mimeType: PropTypes.string,
    /** How much time to wait until it starts recording (in ms) */
    countdownTime: PropTypes.number,
    /** Use this if you want to set a time limit for the video (in ms) */
    timeLimit: PropTypes.number,
    /** Use this if you want to show play/pause/etc. controls on the replay video */
    showReplayControls: PropTypes.bool,
    /** Use this to turn off autoplay and looping of the replay video. It is recommended to also showReplayControls in order to play */
    replayVideoAutoplayAndLoopOff: PropTypes.bool,
    /** Use this if you want to customize the constraints passed to getUserMedia() */
    constraints: PropTypes.shape({
      audio: PropTypes.any,
      video: PropTypes.any
    }),
    chunkSize: PropTypes.number,
    dataAvailableTimeout: PropTypes.number,
    useVideoInput: PropTypes.bool,
    /** Use this to configure the replaying video element's controlslist attribute */
    videoControlsList: PropTypes.string,
    /** Use this to disable picture in picture mode on the replaying video element */
    disablePictureInPicture: PropTypes.bool,

    renderDisconnectedView: PropTypes.func,
    renderLoadingView: PropTypes.func,
    renderVideoInputView: PropTypes.func,
    renderUnsupportedView: PropTypes.func,
    renderErrorView: PropTypes.func,
    renderActions: PropTypes.func,

    cameraViewClassName: PropTypes.string,
    videoClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,

    /** Use this to localize the texts */
    t: PropTypes.func,

    onCameraOn: PropTypes.func,
    onTurnOnCamera: PropTypes.func,
    onSwitchCamera: PropTypes.func,
    onTurnOffCamera: PropTypes.func,
    onStartRecording: PropTypes.func,
    onStopRecording: PropTypes.func,
    onPauseRecording: PropTypes.func,
    onResumeRecording: PropTypes.func,
    onRecordingComplete: PropTypes.func,
    onOpenVideoInput: PropTypes.func,
    onStopReplaying: PropTypes.func,
    onError: PropTypes.func
  }

  static defaultProps = {
    renderUnsupportedView: () => <UnsupportedView />,
    renderErrorView: () => <ErrorView />,
    renderVideoInputView: ({
      videoInput
    }: {
      videoInput: ReactElement | null
    }) => <>{videoInput}</>,
    renderDisconnectedView: () => <DisconnectedView />,
    renderLoadingView: () => <LoadingView />,
    t: (x: string) => x,
    renderActions,
    isFlipped: true,
    countdownTime: 3000,
    constraints: CONSTRAINTS,
    chunkSize: 250,
    dataAvailableTimeout: 500
  }

  videoInput = React.createRef<HTMLInputElement>()

  isComponentUnmounted = false

  timeSinceInactivity = 0

  lastRecordingTimestamp = 0
  recordingDuration = 0

  declare cameraVideo: HTMLVideoElement | null
  declare replayVideo: HTMLVideoElement | null
  declare stream: MediaStream | undefined
  declare mediaRecorder: MediaRecorder | undefined
  declare recordedBlobs: Blob[]
  declare thumbnail: Blob | null
  declare startedAt: number
  declare timeLimitTimeout: ReturnType<typeof setTimeout> | undefined
  // Cleared in turnOffCamera() but never set.
  declare inactivityTimer: ReturnType<typeof setInterval> | undefined
  // [known bug] Passed as the replay's onDurationChange but never defined.
  declare handleDurationChange: undefined

  state: State = {
    isRecording: false,
    isCameraOn: false,
    isConnecting: false,
    isReplayingVideo: false,
    isReplayVideoMuted: true,
    thereWasAnError: false,
    error: null,
    streamIsReady: false,
    isInlineRecordingSupported: null,
    isVideoInputSupported: null,
    stream: undefined,
    currentDeviceId: null,
    availableDeviceIds: []
  }

  componentDidMount () {
    const isInlineRecordingSupported =
      !!window.MediaRecorder && !!navigator.mediaDevices

    const isVideoInputSupported =
      document.createElement('input').capture !== undefined

    this.setState(
      {
        isInlineRecordingSupported,
        isVideoInputSupported
      },
      () => {
        if (this.props.useVideoInput && this.props.isOnInitially) {
          this.handleOpenVideoInput()
        } else if (
          this.state.isInlineRecordingSupported &&
          this.props.isOnInitially
        ) {
          this.turnOnCamera()
        } else if (
          this.state.isVideoInputSupported &&
          this.props.isOnInitially
        ) {
          this.handleOpenVideoInput()
        }
      }
    )
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (
      this.replayVideo &&
      this.state.isReplayingVideo &&
      !prevState.isReplayingVideo
    ) {
      this.tryToUnmuteReplayVideo()
    }

    if (
      this.state.isCameraOn !== prevState.isCameraOn &&
      this.state.isCameraOn
    ) {
      // Only if the cameraVideo ref is available
      if (window.URL && this.cameraVideo) {
        this.cameraVideo.srcObject = this.state.stream!
      } else {
        // For browsers without srcObject. Throws when the ref isn't set.
        this.cameraVideo!.src = this.state.stream as unknown as string
      }
    }
  }

  componentWillUnmount () {
    this.turnOffCamera()
    this.isComponentUnmounted = true
  }

  turnOnCamera = (deviceId: string | null = null) => {
    if (this.props.onTurnOnCamera) {
      this.props.onTurnOnCamera()
    }

    navigator.mediaDevices
      .enumerateDevices()
      .then((mediaDevices) => {
        const videoDevices = mediaDevices.filter((x) => x.kind === 'videoinput')
        if (
          deviceId &&
          videoDevices[0] &&
          videoDevices.find((x) => x.deviceId) === undefined
        ) {
          return this.handleError(
            new ReactVideoRecorderDeviceUnavailableError()
          )
        }

        const currentDeviceId =
          typeof deviceId === 'string' ? deviceId : videoDevices[0].deviceId

        this.setState({
          isConnecting: true,
          isReplayingVideo: false,
          thereWasAnError: false,
          currentDeviceId,
          availableDeviceIds: videoDevices.map((x) => x.deviceId),
          error: null
        })

        const fallbackContraints = {
          audio: true,
          video: true
        }

        const currentConstraints = merge(
          {
            video: {
              deviceId: {
                exact: currentDeviceId
              }
            }
          },
          this.props.constraints
        )

        navigator.mediaDevices
          .getUserMedia(currentConstraints)
          .catch((err) => {
            // there's a bug in chrome in some windows computers where using `ideal` in the constraints throws a NotReadableError
            if (
              err.name === 'NotReadableError' ||
              err.name === 'OverconstrainedError'
            ) {
              console.warn(
                `Got ${err.name}, trying getUserMedia again with fallback constraints`
              )
              return navigator.mediaDevices.getUserMedia(fallbackContraints)
            }
            throw err
          })
          .then(this.handleSuccess)
          .catch(this.handleError)
      })
      .catch(this.handleError)
  }

  handleSwitchCamera = () => {
    if (this.props.onSwitchCamera) {
      this.props.onSwitchCamera()
    }
    const { currentDeviceId, availableDeviceIds } = this.state
    // Stop media tracks
    this.stream && this.stream.getTracks().forEach((stream) => stream.stop())

    const index = availableDeviceIds.findIndex((x) => x === currentDeviceId)
    const maxIndex = availableDeviceIds.length - 1

    if (index < 0) {
      return this.handleError(new ReactVideoRecorderDeviceUnavailableError())
    }

    if (index + 1 > maxIndex) return this.turnOnCamera(availableDeviceIds[0])
    return this.turnOnCamera(availableDeviceIds[index + 1])
  }

  turnOffCamera = () => {
    if (this.props.onTurnOffCamera) {
      this.props.onTurnOffCamera()
    }

    this.stream && this.stream.getTracks().forEach((stream) => stream.stop())
    this.setState({
      isCameraOn: false
    })
    clearInterval(this.inactivityTimer)
  }

  handleSuccess = (stream: MediaStream) => {
    // Since handleSuccess is an async function, we may be in a situation where this was called after the
    // component was unmounted
    if (this.isComponentUnmounted) {
      return
    }

    this.stream = stream
    this.setState({
      isCameraOn: true,
      stream
    })
    if (this.props.onCameraOn) {
      this.props.onCameraOn()
    }

    // there is probably a better way
    // but this makes sure the start recording button
    // gives the stream a couple miliseconds to be ready
    setTimeout(() => {
      this.setState({
        isConnecting: false,
        streamIsReady: true
      })
    }, 200)
  }

  handleError = (err: VideoRecorderError) => {
    const { onError } = this.props

    if (onError) {
      onError(err)
    }

    if (this.isComponentUnmounted) {
      return
    }

    console.error('Captured error', err)

    clearTimeout(this.timeLimitTimeout)

    this.setState({
      isConnecting: this.state.isConnecting && false,
      isRecording: false,
      thereWasAnError: true,
      error: err
    })

    if (this.state.isCameraOn) {
      this.turnOffCamera()
    }
  }

  handleDataIssue = (event: Event) => {
    const error = new ReactVideoRecorderDataIssueError(event)
    console.error(error.message, event)
    this.handleError(error)
    return false
  }

  getMimeType = () => {
    if (this.props.mimeType) {
      return this.props.mimeType
    }

    const mimeType = window.MediaRecorder.isTypeSupported
      ? MIME_TYPES.find(window.MediaRecorder.isTypeSupported)
      : 'video/webm'

    return (this.mediaRecorder && this.mediaRecorder.mimeType) || mimeType || ''
  }

  isDataHealthOK = (event: BlobEvent) => {
    if (!event.data) return this.handleDataIssue(event)

    const { chunkSize } = this.props

    const dataCheckInterval = 2000 / chunkSize

    // in some browsers (FF/S), data only shows up
    // after a certain amount of time ~everyt 2 seconds
    const blobCount = this.recordedBlobs.length
    if (blobCount > dataCheckInterval && blobCount % dataCheckInterval === 0) {
      const blob = new window.Blob(this.recordedBlobs, {
        type: this.getMimeType()
      })
      if (blob.size <= 0) return this.handleDataIssue(event)
    }

    return true
  }

  tryToUnmuteReplayVideo = () => {
    const video = this.replayVideo!
    video.muted = false

    const playPromise = video.play()
    if (!playPromise) {
      video.muted = true
      return
    }

    playPromise
      .then(() => {
        this.setState({ isReplayVideoMuted: false })
        // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
        if (this.props.replayVideoAutoplayAndLoopOff) {
          video.pause()
          video.loop = false
        }
      })
      .catch((err) => {
        console.warn('Could not autoplay replay video', err)
        video.muted = true
        return video.play()
      })
      .catch((err) => {
        console.warn('Could play muted replay video after failed autoplay', err)
      })
  }

  handleDataAvailable = (event: BlobEvent) => {
    if (this.isDataHealthOK(event)) {
      this.recordedBlobs.push(event.data)
    }
  }

  getTotalEllapsedTimeInMs = () =>
    Date.now() - this.lastRecordingTimestamp + this.recordingDuration

  handleStopRecording = () => {
    if (this.props.onStopRecording) {
      this.props.onStopRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.stop()
    this.recordingDuration = this.getTotalEllapsedTimeInMs()
  }

  handlePauseRecording = () => {
    if (this.props.onPauseRecording) {
      this.props.onPauseRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.pause()
    this.recordingDuration = this.getTotalEllapsedTimeInMs()
  }

  handleResumeRecording = () => {
    if (this.props.onResumeRecording) {
      this.props.onResumeRecording()
    }

    if (!this.mediaRecorder) {
      this.handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    this.mediaRecorder.resume()
    this.lastRecordingTimestamp = Date.now()
  }

  handleStartRecording = () => {
    if (this.props.onStartRecording) {
      this.props.onStartRecording()
    }

    this.setState({
      isRunningCountdown: true,
      isReplayingVideo: false
    })

    setTimeout(() => this.startRecording(), this.props.countdownTime)
  }

  startRecording = () => {
    // [known bug] cameraVideo is null if this runs after unmounting.
    captureThumb(this.cameraVideo!).then((thumbnail) => {
      this.thumbnail = thumbnail

      this.recordedBlobs = []
      const options = {
        mimeType: this.getMimeType()
      }

      try {
        this.setState({
          isRunningCountdown: false,
          isRecording: true
        })
        this.startedAt = new Date().getTime()
        this.mediaRecorder = new window.MediaRecorder(this.stream!, options)
        this.mediaRecorder.addEventListener('stop', this.handleStop)
        this.mediaRecorder.addEventListener('error', this.handleError)
        this.mediaRecorder.addEventListener(
          'dataavailable',
          this.handleDataAvailable
        )

        const { timeLimit, chunkSize, dataAvailableTimeout } = this.props
        this.mediaRecorder.start(chunkSize) // collect 10ms of data
        this.lastRecordingTimestamp = Date.now()
        this.recordingDuration = 0

        if (timeLimit) {
          this.timeLimitTimeout = setTimeout(() => {
            this.handleStopRecording()
          }, timeLimit)
        }

        // mediaRecorder.ondataavailable should be called every 10ms,
        // as that's what we're passing to mediaRecorder.start() above
        if (Number.isInteger(dataAvailableTimeout)) {
          setTimeout(() => {
            if (this.recordedBlobs.length === 0) {
              this.handleError(
                new ReactVideoRecorderDataAvailableTimeoutError(
                  dataAvailableTimeout as number
                )
              )
            }
          }, dataAvailableTimeout as number)
        }
      } catch (err) {
        console.error("Couldn't create MediaRecorder", err, options)
        this.handleError(err as Error)
      }
    })
  }

  handleStop = (event: Event) => {
    const endedAt = new Date().getTime()

    if (!this.recordedBlobs || this.recordedBlobs.length <= 0) {
      const error = new ReactVideoRecorderRecordedBlobsUnavailableError(event)
      console.error(error.message, event)
      this.handleError(error)
      return
    }

    clearTimeout(this.timeLimitTimeout)

    const videoBlob =
      this.recordedBlobs.length === 1
        ? this.recordedBlobs[0]
        : new window.Blob(this.recordedBlobs, {
          type: this.getMimeType()
        })

    const thumbnailBlob = this.thumbnail
    const startedAt = this.startedAt
    const duration = endedAt - startedAt

    // if this gets executed too soon, the last chunk of data is lost on FF
    this.mediaRecorder!.ondataavailable = null

    this.fixVideoMetadata(videoBlob).then((fixedVideoBlob) => {
      this.setState({
        isRecording: false,
        isReplayingVideo: true,
        isReplayVideoMuted: true,
        fixedVideoBlob,
        videoUrl: window.URL.createObjectURL(fixedVideoBlob)
      })

      this.turnOffCamera()

      // [known bug] Throws when onRecordingComplete isn't passed.
      this.props.onRecordingComplete!(
        fixedVideoBlob,
        startedAt,
        thumbnailBlob,
        duration
      )
    })
  }

  // see https://bugs.chromium.org/p/chromium/issues/detail?id=642012
  fixVideoMetadata = (rawVideoBlob: Blob): Promise<Blob> => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      return Promise.resolve(rawVideoBlob)
    }
    // see https://stackoverflow.com/a/63568311
    Blob.prototype.arrayBuffer ??= function (this: Blob) {
      return new Response(this).arrayBuffer()
    }

    return fixWebmDuration(rawVideoBlob, this.recordingDuration)
  }

  // Called with React's change event, and with the native one from the
  // listener handleOpenVideoInput() adds.
  handleVideoSelected = (e: Event | ChangeEvent<HTMLInputElement>) => {
    if (this.state.isReplayingVideo) {
      this.setState({
        isReplayingVideo: false
      })
    }

    const files =
      (e.target as HTMLInputElement).files ||
      (e as unknown as DragEvent).dataTransfer!.files
    if (files.length === 0) return

    const startedAt = new Date().getTime()
    const video = files[0]

    // null clears the selection, like ''.
    ;(e.target as HTMLInputElement).value = null as unknown as string

    const extension = video.type === 'video/quicktime' ? 'mov' : undefined

    getVideoInfo(video)
      .then(({ duration, thumbnail }) => {
        this.setState({
          isRecording: false,
          isReplayingVideo: true,
          isReplayVideoMuted: true,
          videoBlob: video,
          videoUrl: window.URL.createObjectURL(video)
        })

        this.props.onRecordingComplete!(
          video,
          startedAt,
          thumbnail,
          duration,
          extension
        )
      })
      .catch((err) => {
        this.handleError(err)
      })
  }

  handleOpenVideoInput = () => {
    if (this.props.onOpenVideoInput) {
      this.props.onOpenVideoInput()
    }

    this.videoInput.current!.value = null as unknown as string
    this.videoInput.current!.click()

    // fixes a bug on iPhone where it doesn't save the recorded video on the second time (if you press the 'Use another video' button)
    this.videoInput.current!.addEventListener('change', this.handleVideoSelected)
  }

  handleStopReplaying = () => {
    if (this.props.onStopReplaying) {
      this.props.onStopReplaying()
    }

    if (this.props.useVideoInput && this.props.isOnInitially) {
      return this.handleOpenVideoInput()
    }

    this.setState({
      isReplayingVideo: false
    })

    if (this.state.isInlineRecordingSupported && this.props.isOnInitially) {
      this.turnOnCamera()
    } else if (this.state.isVideoInputSupported && this.props.isOnInitially) {
      this.handleOpenVideoInput()
    }
  }

  handleReplayVideoClick = () => {
    if (this.replayVideo!.paused && !this.props.showReplayControls) {
      this.replayVideo!.play()
    }

    // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
    if (!this.props.replayVideoAutoplayAndLoopOff) {
      this.setState({
        isReplayVideoMuted: !this.state.isReplayVideoMuted
      })
    }
  }

  renderCameraView () {
    const {
      cameraViewClassName,
      showReplayControls,
      videoControlsList,
      disablePictureInPicture,
      replayVideoAutoplayAndLoopOff,
      renderDisconnectedView,
      renderVideoInputView,
      renderUnsupportedView,
      renderErrorView,
      renderLoadingView,
      useVideoInput,
      videoClassName
    } = this.props

    const {
      isVideoInputSupported,
      isReplayingVideo,
      isInlineRecordingSupported,
      thereWasAnError,
      error,
      isCameraOn,
      isConnecting,
      isReplayVideoMuted,
      isRecording,
      availableDeviceIds
    } = this.state

    const shouldUseVideoInput =
      useVideoInput || (!isInlineRecordingSupported && isVideoInputSupported)

    const videoInput = shouldUseVideoInput
      ? (
          <input
            ref={this.videoInput}
            key='videoInput'
            type='file'
            accept='video/*'
            capture={useVideoInput ? undefined : 'user'}
            style={{ display: 'none' }}
            onChange={this.handleVideoSelected}
          />
        )
      : null

    if (isReplayingVideo) {
      return (
        <CameraView key='replay' className={cameraViewClassName}>
          <Video
            ref={(el) => (this.replayVideo = el)}
            className={videoClassName}
            src={this.state.videoUrl}
            loop
            muted={isReplayVideoMuted}
            playsInline
            autoPlay={!replayVideoAutoplayAndLoopOff}
            controls={showReplayControls}
            onClick={this.handleReplayVideoClick}
            onDurationChange={this.handleDurationChange}
            controlsList={videoControlsList}
            disablePictureInPicture={disablePictureInPicture}
          />
          {videoInput}
        </CameraView>
      )
    }

    if (shouldUseVideoInput) {
      return renderVideoInputView({ videoInput })
    }

    if (!isInlineRecordingSupported) {
      return renderUnsupportedView()
    }

    if (thereWasAnError) {
      return renderErrorView({ error })
    }

    if (isCameraOn) {
      // Enable switch camera button, only if not recording and multiple video sources available
      const switchCameraControl =
        availableDeviceIds && availableDeviceIds.length >= 2 && !isRecording
          ? (
              <SwitchCameraView onClick={this.handleSwitchCamera} />
            )
          : null

      return (
        <CameraView key='camera'>
          <Video
            isFlipped={this.props.isFlipped}
            ref={(el) => (this.cameraVideo = el)}
            autoPlay
            muted
            playsInline
          />
          {switchCameraControl}
        </CameraView>
      )
    }

    if (isConnecting) {
      return renderLoadingView()
    }

    return renderDisconnectedView()
  }

  render () {
    const {
      isVideoInputSupported,
      isInlineRecordingSupported,
      thereWasAnError,
      isRecording,
      isCameraOn,
      streamIsReady,
      isConnecting,
      isRunningCountdown,
      isReplayingVideo,
      isReplayVideoMuted
    } = this.state

    const {
      countdownTime,
      timeLimit,
      showReplayControls,
      replayVideoAutoplayAndLoopOff,
      renderActions,
      t,
      useVideoInput,
      wrapperClassName
    } = this.props

    return (
      <Wrapper className={wrapperClassName}>
        {this.renderCameraView()}
        {renderActions({
          t,
          isVideoInputSupported,
          isInlineRecordingSupported,
          thereWasAnError,
          isRecording,
          isCameraOn,
          streamIsReady,
          isConnecting,
          isRunningCountdown,
          isReplayingVideo,
          isReplayVideoMuted,
          countdownTime,
          timeLimit,
          showReplayControls,
          replayVideoAutoplayAndLoopOff,
          useVideoInput,

          onTurnOnCamera: () => this.turnOnCamera(),
          onSwitchCamera: this.handleSwitchCamera,
          onTurnOffCamera: this.turnOffCamera,
          onOpenVideoInput: this.handleOpenVideoInput,
          onStartRecording: this.handleStartRecording,
          onStopRecording: this.handleStopRecording,
          onPauseRecording: this.handlePauseRecording,
          onResumeRecording: this.handleResumeRecording,
          onStopReplaying: this.handleStopReplaying
        })}
      </Wrapper>
    )
  }
}
