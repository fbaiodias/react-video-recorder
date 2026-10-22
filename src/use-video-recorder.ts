import { useEffect, useLayoutEffect, useReducer, useState } from 'react'
import fixWebmDuration from 'fix-webm-duration'

import getVideoInfo, { captureThumb } from './get-video-info.ts'
import {
  ReactVideoRecorderDataIssueError,
  ReactVideoRecorderRecordedBlobsUnavailableError,
  ReactVideoRecorderDataAvailableTimeoutError,
  ReactVideoRecorderMediaRecorderUnavailableError,
  ReactVideoRecorderDeviceUnavailableError
} from './custom-errors.ts'
import type {
  UseVideoRecorderOptions,
  VideoRecorderController,
  VideoRecorderError,
  VideoRecorderState,
  VideoRecorderStatus
} from './types.ts'

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

type Options = UseVideoRecorderOptions & {
  countdownTime: number
  constraints: MediaStreamConstraints
  chunkSize: number
  dataAvailableTimeout: number | null
}

// Like React's defaultProps, defaults apply only when an option is
// undefined: `dataAvailableTimeout: null` turns the check off.
const withDefault = <T>(value: T | undefined, fallback: T): T =>
  value === undefined ? fallback : value

const withDefaults = (options: UseVideoRecorderOptions): Options => ({
  ...options,
  countdownTime: withDefault(options.countdownTime, 3000),
  constraints: withDefault(options.constraints, CONSTRAINTS),
  chunkSize: withDefault(options.chunkSize, 250),
  dataAvailableTimeout: withDefault(options.dataAvailableTimeout, 500)
})

const initialState: VideoRecorderState = {
  isRecording: false,
  isPaused: false,
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

// State updates merge, like a class component's setState().
const mergeState = (
  state: VideoRecorderState,
  patch: Partial<VideoRecorderState>
): VideoRecorderState => ({ ...state, ...patch })

export function getStatus(state: VideoRecorderState): VideoRecorderStatus {
  if (state.isInlineRecordingSupported === null) return 'initializing'
  if (state.thereWasAnError) return 'error'
  if (state.isReplayingVideo) return 'replaying'
  if (state.isRecording) return state.isPaused ? 'paused' : 'recording'
  if (state.isRunningCountdown) return 'countdown'
  if (state.isConnecting) return 'connecting'
  if (state.isCameraOn && state.streamIsReady) return 'ready'
  if (!state.isInlineRecordingSupported && !state.isVideoInputSupported) {
    return 'unsupported'
  }
  return 'idle'
}

type Timeout = ReturnType<typeof setTimeout>

// The constraints, asking for this exact camera.
function withDevice(
  constraints: MediaStreamConstraints,
  deviceId: string
): MediaStreamConstraints {
  const { video } = constraints
  if (video === false) return constraints
  return {
    ...constraints,
    video: {
      ...(typeof video === 'object' ? video : {}),
      deviceId: { exact: deviceId }
    }
  }
}

function getVideoSettings(stream: MediaStream): MediaTrackSettings {
  const track = stream.getVideoTracks && stream.getVideoTracks()[0]
  return (track && track.getSettings && track.getSettings()) || {}
}

// Everything that isn't rendered: media objects, timers and DOM elements.
interface Internals {
  mounted: boolean
  paused: boolean
  // Bumped on unmount. Async work started before then is ignored, and any
  // stream it produces is stopped.
  generation: number
  initialActionPending: boolean
  stream?: MediaStream
  mediaRecorder?: MediaRecorder
  recordedBlobs: Blob[]
  thumbnail: Blob | null
  startedAt: number
  lastRecordingTimestamp: number
  recordingDuration: number
  streamReadyTimeout?: Timeout
  countdownTimeout?: Timeout
  timeLimitTimeout?: Timeout
  dataAvailableTimeout?: Timeout
  cameraVideo: HTMLVideoElement | null
  replayVideo: HTMLVideoElement | null
  videoInput: HTMLInputElement | null
}

// The recorder's logic. It's created once per component and keeps the latest
// options and rendered state (see update()), so its functions stay stable and
// read current values when called, like a class component's methods.
function createRecorder(
  setState: (patch: Partial<VideoRecorderState>) => void
) {
  let options = withDefaults({})
  let state = initialState
  const getOptions = () => options
  const getState = () => state

  const r: Internals = {
    mounted: false,
    paused: false,
    generation: 0,
    initialActionPending: false,
    recordedBlobs: [],
    thumbnail: null,
    startedAt: 0,
    lastRecordingTimestamp: 0,
    recordingDuration: 0,
    cameraVideo: null,
    replayVideo: null,
    videoInput: null
  }

  const isCurrent = (generation: number) => generation === r.generation

  const stopStream = (stream: MediaStream | undefined) =>
    stream && stream.getTracks().forEach((track) => track.stop())

  function turnOnCamera(deviceId: string | null = null) {
    const { onTurnOnCamera } = getOptions()
    if (onTurnOnCamera) {
      onTurnOnCamera()
    }

    const generation = r.generation
    navigator.mediaDevices
      .enumerateDevices()
      .then((mediaDevices) => {
        if (!isCurrent(generation)) return

        const videoDevices = mediaDevices.filter((x) => x.kind === 'videoinput')
        if (deviceId && !videoDevices.some((x) => x.deviceId === deviceId)) {
          return handleError(new ReactVideoRecorderDeviceUnavailableError())
        }

        setState({
          isConnecting: true,
          isReplayingVideo: false,
          thereWasAnError: false,
          // Corrected from the stream's settings once it arrives.
          currentDeviceId:
            deviceId || (videoDevices[0] && videoDevices[0].deviceId) || null,
          availableDeviceIds: videoDevices.map((x) => x.deviceId),
          error: null
        })

        const fallbackContraints = {
          audio: true,
          video: true
        }

        // Without a requested camera, the constraints decide (e.g. with
        // facingMode). Browsers only list device ids after access is granted.
        const { constraints } = getOptions()
        const currentConstraints = deviceId
          ? withDevice(constraints, deviceId)
          : constraints

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
          .then(
            (stream) => handleSuccess(stream, generation),
            (err) => isCurrent(generation) && handleError(err)
          )
      })
      .catch((err) => isCurrent(generation) && handleError(err))
  }

  function switchCamera() {
    const { onSwitchCamera } = getOptions()
    if (onSwitchCamera) {
      onSwitchCamera()
    }
    const { currentDeviceId, availableDeviceIds } = getState()
    // Stop media tracks
    stopStream(r.stream)

    const index = availableDeviceIds.findIndex((x) => x === currentDeviceId)
    const maxIndex = availableDeviceIds.length - 1

    if (index < 0) {
      return handleError(new ReactVideoRecorderDeviceUnavailableError())
    }

    if (index + 1 > maxIndex) return turnOnCamera(availableDeviceIds[0])
    return turnOnCamera(availableDeviceIds[index + 1])
  }

  function turnOffCamera() {
    const { onTurnOffCamera } = getOptions()
    if (onTurnOffCamera) {
      onTurnOffCamera()
    }

    stopStream(r.stream)
    clearTimeout(r.countdownTimeout)
    setState({
      isCameraOn: false,
      // A countdown can't end in a recording without the camera.
      ...(getState().isRunningCountdown ? { isRunningCountdown: false } : {})
    })
  }

  function handleSuccess(stream: MediaStream, generation: number) {
    // The component unmounted while waiting for the camera.
    if (!isCurrent(generation)) {
      stopStream(stream)
      return
    }

    r.stream = stream
    const settings = getVideoSettings(stream)
    setState({
      isCameraOn: true,
      stream,
      facingMode: settings.facingMode,
      currentDeviceId: settings.deviceId || getState().currentDeviceId
    })
    const { onCameraOn } = getOptions()
    if (onCameraOn) {
      onCameraOn()
    }

    // With access granted, the camera list has real ids to switch between.
    navigator.mediaDevices
      .enumerateDevices()
      .then((mediaDevices) => {
        if (!isCurrent(generation)) return
        setState({
          availableDeviceIds: mediaDevices
            .filter((x) => x.kind === 'videoinput')
            .map((x) => x.deviceId)
        })
      })
      .catch(() => {})

    // there is probably a better way
    // but this makes sure the start recording button
    // gives the stream a couple miliseconds to be ready
    r.streamReadyTimeout = setTimeout(() => {
      setState({
        isConnecting: false,
        streamIsReady: true
      })
    }, 200)
  }

  function handleError(err: VideoRecorderError) {
    const { onError } = getOptions()

    if (onError) {
      onError(err)
    }

    if (!r.mounted) {
      return
    }

    console.error('Captured error', err)

    const wasCountingDown = getState().isRunningCountdown
    discardRecording()

    setState({
      isConnecting: false,
      isRecording: false,
      isPaused: false,
      ...(wasCountingDown ? { isRunningCountdown: false } : {}),
      thereWasAnError: true,
      error: err
    })

    if (getState().isCameraOn) {
      turnOffCamera()
    }
  }

  function handleDataIssue(event: Event) {
    const error = new ReactVideoRecorderDataIssueError(event)
    console.error(error.message, event)
    handleError(error)
    return false
  }

  function getMimeType() {
    const { mimeType: forcedMimeType } = getOptions()
    if (forcedMimeType) {
      return forcedMimeType
    }

    const mimeType = window.MediaRecorder.isTypeSupported
      ? MIME_TYPES.find((type) => window.MediaRecorder.isTypeSupported(type))
      : 'video/webm'

    return (r.mediaRecorder && r.mediaRecorder.mimeType) || mimeType || ''
  }

  function isDataHealthOK(event: BlobEvent) {
    if (!event.data) return handleDataIssue(event)

    const { chunkSize } = getOptions()

    const dataCheckInterval = 2000 / chunkSize

    // in some browsers (FF/S), data only shows up
    // after a certain amount of time ~everyt 2 seconds
    const blobCount = r.recordedBlobs.length
    if (blobCount > dataCheckInterval && blobCount % dataCheckInterval === 0) {
      const blob = new window.Blob(r.recordedBlobs, {
        type: getMimeType()
      })
      if (blob.size <= 0) return handleDataIssue(event)
    }

    return true
  }

  function tryToUnmuteReplayVideo() {
    const video = r.replayVideo
    if (!video) return
    video.muted = false

    const playPromise = video.play()
    if (!playPromise) {
      video.muted = true
      return
    }

    playPromise
      .then(() => {
        setState({ isReplayVideoMuted: false })
        // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
        if (getOptions().replayVideoAutoplayAndLoopOff) {
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

  function handleDataAvailable(event: BlobEvent) {
    if (isDataHealthOK(event)) {
      r.recordedBlobs.push(event.data)
    }
  }

  const getTotalEllapsedTimeInMs = () =>
    Date.now() - r.lastRecordingTimestamp + r.recordingDuration

  function stopRecording() {
    const { onStopRecording } = getOptions()
    if (onStopRecording) {
      onStopRecording()
    }

    if (!r.mediaRecorder) {
      handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    r.mediaRecorder.stop()
    // While paused, recordingDuration already has the recorded time.
    if (!r.paused) r.recordingDuration = getTotalEllapsedTimeInMs()
    r.paused = false
  }

  function pauseRecording() {
    const { onPauseRecording } = getOptions()
    if (onPauseRecording) {
      onPauseRecording()
    }

    if (!r.mediaRecorder) {
      handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    if (r.paused) return
    r.mediaRecorder.pause()
    r.paused = true
    r.recordingDuration = getTotalEllapsedTimeInMs()
    // The time limit counts recorded time only.
    clearTimeout(r.timeLimitTimeout)
    setState({ isPaused: true })
  }

  function resumeRecording() {
    const { onResumeRecording } = getOptions()
    if (onResumeRecording) {
      onResumeRecording()
    }

    if (!r.mediaRecorder) {
      handleError(new ReactVideoRecorderMediaRecorderUnavailableError())
      return
    }

    if (!r.paused) return
    r.mediaRecorder.resume()
    r.paused = false
    r.lastRecordingTimestamp = Date.now()
    const { timeLimit } = getOptions()
    if (timeLimit) {
      r.timeLimitTimeout = setTimeout(() => {
        stopRecording()
      }, timeLimit - r.recordingDuration)
    }
    setState({ isPaused: false })
  }

  function startRecording() {
    const { onStartRecording, countdownTime } = getOptions()
    if (onStartRecording) {
      onStartRecording()
    }

    setState({
      isRunningCountdown: true,
      isReplayingVideo: false
    })

    r.countdownTimeout = setTimeout(() => recordAfterCountdown(), countdownTime)
  }

  function recordAfterCountdown() {
    // Rejects when the camera <video> is gone; handleError reports it.
    captureThumb(r.cameraVideo!).then((thumbnail) => {
      r.thumbnail = thumbnail

      r.recordedBlobs = []
      const options = {
        mimeType: getMimeType()
      }

      try {
        setState({
          isRunningCountdown: false,
          isRecording: true,
          isPaused: false
        })
        r.startedAt = new Date().getTime()
        r.mediaRecorder = new window.MediaRecorder(r.stream!, options)
        r.mediaRecorder.addEventListener('stop', handleStop)
        r.mediaRecorder.addEventListener('error', handleError)
        r.mediaRecorder.addEventListener('dataavailable', handleDataAvailable)

        const { timeLimit, chunkSize, dataAvailableTimeout } = getOptions()
        r.mediaRecorder.start(chunkSize) // collect 10ms of data
        r.lastRecordingTimestamp = Date.now()
        r.recordingDuration = 0
        r.paused = false

        if (timeLimit) {
          r.timeLimitTimeout = setTimeout(() => {
            stopRecording()
          }, timeLimit)
        }

        // The first data is due after chunkSize ms. Fail if it hasn't come
        // dataAvailableTimeout ms after that.
        if (Number.isInteger(dataAvailableTimeout)) {
          const wait = chunkSize + (dataAvailableTimeout as number)
          r.dataAvailableTimeout = setTimeout(() => {
            if (r.recordedBlobs.length === 0) {
              handleError(new ReactVideoRecorderDataAvailableTimeoutError(wait))
            }
          }, wait)
        }
      } catch (err) {
        console.error("Couldn't create MediaRecorder", err, options)
        handleError(err as Error)
      }
    }, handleError)
  }

  function handleStop(event: Event) {
    const endedAt = new Date().getTime()

    if (!r.recordedBlobs || r.recordedBlobs.length <= 0) {
      const error = new ReactVideoRecorderRecordedBlobsUnavailableError(event)
      console.error(error.message, event)
      handleError(error)
      return
    }

    clearTimeout(r.timeLimitTimeout)

    const videoBlob =
      r.recordedBlobs.length === 1
        ? r.recordedBlobs[0]
        : new window.Blob(r.recordedBlobs, {
            type: getMimeType()
          })

    const thumbnailBlob = r.thumbnail
    const startedAt = r.startedAt
    const duration = endedAt - startedAt

    // if this gets executed too soon, the last chunk of data is lost on FF
    r.mediaRecorder!.ondataavailable = null

    // Errors thrown by onRecordingComplete stay unhandled, for the app to see.
    void fixVideoMetadata(videoBlob)
      .catch((err) => {
        // The video still plays without the duration fix; don't lose it.
        console.warn('Could not fix the WebM duration', err)
        return videoBlob
      })
      .then((fixedVideoBlob) => {
        setState({
          isRecording: false,
          isPaused: false,
          isReplayingVideo: true,
          isReplayVideoMuted: true,
          fixedVideoBlob,
          videoUrl: window.URL.createObjectURL(fixedVideoBlob)
        })

        turnOffCamera()

        const { onRecordingComplete } = getOptions()
        if (onRecordingComplete) {
          onRecordingComplete(
            fixedVideoBlob,
            startedAt,
            thumbnailBlob,
            duration
          )
        }
      })
  }

  // see https://bugs.chromium.org/p/chromium/issues/detail?id=642012
  function fixVideoMetadata(rawVideoBlob: Blob): Promise<Blob> {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isSafari) {
      return Promise.resolve(rawVideoBlob)
    }
    // see https://stackoverflow.com/a/63568311
    // oxlint-disable-next-line typescript/unbound-method -- only checks it exists
    Blob.prototype.arrayBuffer ??= function (this: Blob) {
      return new Response(this).arrayBuffer()
    }

    return fixWebmDuration(rawVideoBlob, r.recordingDuration)
  }

  // Called with React's change event, and with the native one from the
  // listener openVideoInput() adds.
  function handleVideoInputChange(e: Event | { target: EventTarget | null }) {
    if (getState().isReplayingVideo) {
      setState({
        isReplayingVideo: false
      })
    }

    const files =
      (e.target as HTMLInputElement).files ||
      (e as unknown as DragEvent).dataTransfer!.files
    if (files.length === 0) return

    if (getState().thereWasAnError) {
      setState({ thereWasAnError: false, error: null })
    }

    const startedAt = new Date().getTime()
    const video = files[0]

    // null clears the selection, like ''.
    ;(e.target as HTMLInputElement).value = null as unknown as string

    const extension = video.type === 'video/quicktime' ? 'mov' : undefined

    const generation = r.generation
    getVideoInfo(video)
      .then(({ duration, thumbnail }) => {
        if (!isCurrent(generation)) return
        setState({
          isRecording: false,
          isReplayingVideo: true,
          isReplayVideoMuted: true,
          videoBlob: video,
          videoUrl: window.URL.createObjectURL(video)
        })

        const { onRecordingComplete } = getOptions()
        if (onRecordingComplete) {
          onRecordingComplete(video, startedAt, thumbnail, duration, extension)
        }
      })
      .catch((err) => {
        if (isCurrent(generation)) handleError(err)
      })
  }

  function openVideoInput() {
    const { onOpenVideoInput } = getOptions()
    if (onOpenVideoInput) {
      onOpenVideoInput()
    }

    r.videoInput!.value = null as unknown as string
    r.videoInput!.click()

    // fixes a bug on iPhone where it doesn't save the recorded video on the second time (if you press the 'Use another video' button)
    r.videoInput!.addEventListener('change', handleVideoInputChange)
  }

  function stopReplaying() {
    const { onStopReplaying, useVideoInput, isOnInitially } = getOptions()
    if (onStopReplaying) {
      onStopReplaying()
    }

    if (useVideoInput && isOnInitially) {
      return openVideoInput()
    }

    setState({
      isReplayingVideo: false
    })

    const { isInlineRecordingSupported, isVideoInputSupported } = getState()
    if (isInlineRecordingSupported && isOnInitially) {
      turnOnCamera()
    } else if (isVideoInputSupported && isOnInitially) {
      openVideoInput()
    }
  }

  function handleReplayVideoClick() {
    const { showReplayControls, replayVideoAutoplayAndLoopOff } = getOptions()
    if (r.replayVideo!.paused && !showReplayControls) {
      r.replayVideo!.play().catch((err) => {
        console.warn('Could not play the replay video', err)
      })
    }

    // fixes bug where seeking control during autoplay is not available until the video is almost completely played through
    if (!replayVideoAutoplayAndLoopOff) {
      setState({
        isReplayVideoMuted: !getState().isReplayVideoMuted
      })
    }
  }

  function mount() {
    r.mounted = true
    r.initialActionPending = true
    setState({
      isInlineRecordingSupported:
        !!window.MediaRecorder && !!navigator.mediaDevices,
      isVideoInputSupported:
        document.createElement('input').capture !== undefined
    })
  }

  // Runs once the support flags from mount() have been rendered, so that the
  // file input exists when the picker has to open.
  function runInitialAction() {
    if (!r.initialActionPending) return
    r.initialActionPending = false

    const { useVideoInput, isOnInitially } = getOptions()
    const { isInlineRecordingSupported, isVideoInputSupported } = getState()
    if (useVideoInput && isOnInitially) {
      openVideoInput()
    } else if (isInlineRecordingSupported && isOnInitially) {
      turnOnCamera()
    } else if (isVideoInputSupported && isOnInitially) {
      openVideoInput()
    }
  }

  function unmount() {
    turnOffCamera()
    r.mounted = false
    r.generation += 1
    r.initialActionPending = false

    clearTimeout(r.streamReadyTimeout)
    discardRecording()
  }

  // Cancels the countdown and stops any recording without reporting it.
  function discardRecording() {
    clearTimeout(r.countdownTimeout)
    clearTimeout(r.timeLimitTimeout)
    clearTimeout(r.dataAvailableTimeout)

    const { mediaRecorder } = r
    if (mediaRecorder) {
      mediaRecorder.removeEventListener('stop', handleStop)
      mediaRecorder.removeEventListener('error', handleError)
      mediaRecorder.removeEventListener('dataavailable', handleDataAvailable)
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop()
    }
    r.paused = false
  }

  // Shows the stream in the camera <video>.
  function showStream(stream: MediaStream | undefined) {
    // Only if the cameraVideo ref is available
    if (window.URL && r.cameraVideo) {
      r.cameraVideo.srcObject = stream!
    } else {
      // For browsers without srcObject. Throws when the ref isn't set.
      r.cameraVideo!.src = stream as unknown as string
    }
  }

  return {
    // Called after every render with the options and state it used.
    update(nextOptions: Options, nextState: VideoRecorderState) {
      options = nextOptions
      state = nextState
    },
    turnOnCamera,
    turnOffCamera,
    switchCamera,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    openVideoInput,
    stopReplaying,
    handleVideoInputChange,
    handleReplayVideoClick,
    tryToUnmuteReplayVideo,
    showStream,
    mount,
    runInitialAction,
    unmount,
    setCameraVideo: (element: HTMLVideoElement | null) => {
      r.cameraVideo = element
    },
    setReplayVideo: (element: HTMLVideoElement | null) => {
      r.replayVideo = element
    },
    setVideoInput: (element: HTMLInputElement | null) => {
      r.videoInput = element
    }
  }
}

// useLayoutEffect, like a class's componentDidMount/componentDidUpdate, so the
// support check lands before the first paint. On the server it's a no-op
// either way; this just avoids React 18's warning there.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * The recorder without UI: state, actions and the refs to attach to your own
 * <video> and <input type="file"> elements. <VideoRecorder> is built on it.
 */
export function useVideoRecorder(
  options: UseVideoRecorderOptions = {}
): VideoRecorderController {
  const [state, setState] = useReducer(mergeState, initialState)
  const [recorder] = useState(() => createRecorder(setState))

  useIsomorphicLayoutEffect(() => {
    recorder.update(withDefaults(options), state)
  })

  useIsomorphicLayoutEffect(() => {
    recorder.mount()
    return () => recorder.unmount()
  }, [recorder])

  useIsomorphicLayoutEffect(() => {
    if (state.isInlineRecordingSupported !== null) recorder.runInitialAction()
  }, [recorder, state.isInlineRecordingSupported, state.isVideoInputSupported])

  useIsomorphicLayoutEffect(() => {
    if (state.isReplayingVideo) recorder.tryToUnmuteReplayVideo()
  }, [recorder, state.isReplayingVideo])

  useIsomorphicLayoutEffect(() => {
    if (state.isCameraOn) recorder.showStream(state.stream)
  }, [recorder, state.isCameraOn, state.stream])

  return {
    state,
    status: getStatus(state),
    turnOnCamera: recorder.turnOnCamera,
    turnOffCamera: recorder.turnOffCamera,
    switchCamera: recorder.switchCamera,
    startRecording: recorder.startRecording,
    stopRecording: recorder.stopRecording,
    pauseRecording: recorder.pauseRecording,
    resumeRecording: recorder.resumeRecording,
    openVideoInput: recorder.openVideoInput,
    stopReplaying: recorder.stopReplaying,
    handleVideoInputChange: recorder.handleVideoInputChange,
    handleReplayVideoClick: recorder.handleReplayVideoClick,
    setCameraVideo: recorder.setCameraVideo,
    setReplayVideo: recorder.setReplayVideo,
    setVideoInput: recorder.setVideoInput
  }
}
