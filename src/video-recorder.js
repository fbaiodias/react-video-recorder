import React, { Component } from 'react'
import styled from 'styled-components'

// data shows up on some browsers
// approx every 2 seconds
const chunkSizeInMS = 250
const dataCheckInterval = 2000 / chunkSizeInMS

const getMimeType = () => {
  let mimeType = 'video/webm;codecs=vp9'
  if (!window.MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8'
    if (!window.MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm'
      if (!window.MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''
      }
    }
  }
  return mimeType
}

let constraints = {
  audio: true,
  video: true
}

const _cameraInactivityTimeoutSeconds = 60 // seconds
const _tabInactivityTimeoutSeconds = _cameraInactivityTimeoutSeconds

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 119px;
`

const CameraView = styled.div`
  width: 100%;
  height: 100%;
`

const Video = styled.video`
  width: 100%;
  max-height: 100%;
`

const isIOSSafari = () => {
  const ua = window.navigator.userAgent
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  const webkit = !!ua.match(/WebKit/i)
  return iOS && webkit && !ua.match(/CriOS/i)
}

const captureThumb = videoTag =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = videoTag.videoWidth
    canvas.height = videoTag.videoHeight
    canvas.getContext('2d').drawImage(
      videoTag,
      0, // top
      0, // left
      videoTag.videoWidth,
      videoTag.videoHeight
    )
    canvas.toBlob(thumbnail => {
      resolve(thumbnail)
    })
  })

const getVideoInfo = videoBlob =>
  new Promise((resolve, reject) => {
    const videoTag = document.createElement('video')
    videoTag.preload = 'metadata'
    videoTag.muted = true
    videoTag.playsInline = true

    videoTag.addEventListener('loadeddata', function () {
      const duration = videoTag.duration * 1000

      captureThumb(videoTag)
        .then(thumbnail => {
          window.URL.revokeObjectURL(this.src)
          videoTag.pause()
          resolve({ duration, thumbnail })
        })
        .catch(reject)
    })

    videoTag.src = window.URL.createObjectURL(videoBlob)
    videoTag.play()
  })

export default class VideoRecorder extends Component {
  constructor (props) {
    super(props)

    const isInlineRecordingSupported = !!window.MediaSource
    const isVideoInputSupported = isIOSSafari()

    this.state = {
      isRecording: false,
      isCameraOn: false,
      isConnecting: false,
      thereWasAnError: false,
      streamIsReady: false,
      isInlineRecordingSupported,
      isVideoInputSupported,
      stream: undefined,
      showInstallModal: false,
      installClicked: false
    }

    this.handleSuccess = this.handleSuccess.bind(this)
    this.turnOnCamera = this.turnOnCamera.bind(this)
    this.turnOffCamera = this.turnOffCamera.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleStartRecording = this.handleStartRecording.bind(this)
    this.handleStopRecording = this.handleStopRecording.bind(this)
    this.handleDataAvailable = this.handleDataAvailable.bind(this)
    this.handleStop = this.handleStop.bind(this)
    this.renderCameraView = this.renderCameraView.bind(this)
    this.checkInactivity = this.checkInactivity.bind(this)
    this.handleVideoSelected = this.handleVideoSelected.bind(this)

    this.timeSinceInactivity = 0
  }

  componentWillMount () {
    if (this.state.isInlineRecordingSupported) {
      this.mediaSource = new window.MediaSource()
    }
  }

  componentDidMount () {
    if (this.state.isInlineRecordingSupported && this.props.isOnInitially) {
      this.turnOnCamera()
    }
  }

  componentWillUnmount () {
    this.turnOffCamera()
  }

  checkInactivity () {
    if (this.state.isRecording === false && this.state.isCameraOn === true) {
      this.timeSinceInactivity++
    }

    if (
      this.timeSinceInactivity > _cameraInactivityTimeoutSeconds ||
      (!document.hasFocus() &&
        this.timeSinceInactivity > _tabInactivityTimeoutSeconds)
    ) {
      this.timeSinceInactivity = 0
      this.turnOffCamera()
    }
  }

  turnOnCamera (cameraType) {
    console.log('Start initializing camera...')
    this.inactivityTimer = setInterval(
      this.checkInactivity,
      1000 // one second
    )

    this.setState({
      isConnecting: true,
      thereWasAnError: false
    })

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this.handleSuccess)
      .catch(this.handleError)
  }

  turnOffCamera () {
    this.stream && this.stream.getTracks().forEach(stream => stream.stop())
    this.setState({
      isCameraOn: false
    })
    clearInterval(this.inactivityTimer)
  }

  handleSuccess (stream) {
    console.log('Turning camera on')

    console.log('Audio tracks', stream.getAudioTracks())
    console.log('Video tracks', stream.getVideoTracks())
    this.stream = stream
    this.setState({
      isCameraOn: true,
      stream: stream
    })

    if (window.URL) {
      console.log('!')
      this.videoTag.srcObject = stream
    } else {
      this.videoTag.src = stream
      console.log('2')
    }

    // there is probably a better way
    // but this makes sure the start recording button
    // gives the steam a couple seconds to be ready
    // --- Ideally there would be a property to checkk....
    setTimeout(() => {
      this.setState({
        isConnecting: false,
        streamIsReady: true
      })
    }, 200)
  }

  handleError (err) {
    console.error('Captured error', err)

    this.setState({
      isConnecting: this.state.isConnecting && false,
      thereWasAnError: true
    })

    if (this.state.isCameraOn) {
      this.turnOffCamera()
    }
  }

  onDataIssue (event) {
    console.log(event.data, event.data.size)
    console.error("Couldn't get data from event", event)
    this.handleError(new Error("Couldn't get data from event"))
    return false
  }

  isDataHealthOK (event) {
    if (!event.data) return this.onDataIssue(event)

    // in some browsers (FF/S), data only shows up
    // after a certain amount of time ~everyt 2 seconds
    const blobCount = this.recordedBlobs.length
    if (blobCount > dataCheckInterval && blobCount % dataCheckInterval === 0) {
      const blob = new window.Blob(this.recordedBlobs, {
        type: getMimeType()
      })
      if (blob.size <= 0) return this.onDataIssue(event)
      console.log('Recoreded', blob.size)
    }

    return true
  }

  handleDataAvailable (event) {
    if (this.isDataHealthOK(event)) {
      this.recordedBlobs.push(event.data)
    }
  }

  handleStopRecording () {
    if (!this.mediaRecorder) {
      this.handleError(new Error("Couldn't get mediaRecorder"))
      return
    }

    this.mediaRecorder.stop()
    this.setState({
      isRecording: false
    })
  }

  handleStartRecording () {
    console.log(this.stream, this.stream.active)

    captureThumb(this.videoTag).then(thumbnail => {
      this.thumbnail = thumbnail

      this.recordedBlobs = []
      const options = {
        mimeType: getMimeType()
      }

      try {
        this.setState({
          isRecording: true
        })
        this.startedAt = new Date().getTime()
        this.mediaRecorder = new window.MediaRecorder(this.stream, options)
        this.mediaRecorder.onstop = this.handleStop
        this.mediaRecorder.onerror = this.handleError
        this.mediaRecorder.ondataavailable = this.handleDataAvailable
        this.mediaRecorder.start(chunkSizeInMS) // collect 10ms of data

        console.log(
          'Created MediaRecorder',
          this.mediaRecorder,
          'with mimeType',
          options.mimeType
        )

        // mediaRecorder.ondataavailable should be called every 10ms,
        // as that's what we're passing to mediaRecorder.start() above
        setTimeout(() => {
          if (this.recordedBlobs.length === 0) {
            console.error(
              "Method mediaRecorder.ondataavailable wasn't called after 500ms"
            )
            this.handleError(
              new Error(
                "Method mediaRecorder.ondataavailable wasn't called after 500ms"
              )
            )
          }
        }, 500)
      } catch (err) {
        console.error("Couldn't create MediaRecorder", err, options)
        this.handleError(err)
      }
    })
  }

  handleStop (event) {
    console.log('Recorder stopped: ', event)
    const endedAt = new Date().getTime()

    if (!this.recordedBlobs || this.recordedBlobs.length <= 0) {
      console.error("Couldn't get recordedBlobs", event)
      this.handleError(new Error("Couldn't get recordedBlobs"))
      return
    }

    const videoBlob = new window.Blob(this.recordedBlobs, {
      type: getMimeType()
    })
    // const videoBlob = new window.Blob(this.recordedBlobs)
    const thumbnailBlob = this.thumbnail
    const startedAt = this.startedAt
    const duration = endedAt - startedAt

    console.log('Calling Callback')

    // if this gets executed to soon, the last chunk of data is lost on FF
    this.mediaRecorder.ondataavailable = null

    this.props.onRecordingComplete(
      videoBlob,
      startedAt,
      thumbnailBlob,
      duration
    )
  }

  handleVideoSelected (e) {
    const files = e.target.files || e.dataTransfer.files
    if (files.length === 0) return

    const startedAt = new Date().getTime()
    const video = files[0]

    const extension = video.type === 'video/quicktime' ? 'mov' : undefined

    getVideoInfo(video).then(({ duration, thumbnail }) => {
      console.log('Calling Callback')
      this.props.onRecordingComplete(
        video,
        startedAt,
        thumbnail,
        duration,
        extension
      )
    })
  }

  handleOpenVideoInput () {
    this.videoInput.click()
  }

  renderCameraView () {
    const {
      DisconnectedView,
      UnsupportedView,
      ErrorView,
      LoadingView
    } = this.props

    if (this.state.isVideoInputSupported) {
      return (
        <input
          ref={el => (this.videoInput = el)}
          type='file'
          accept='video/*'
          capture='camcorder'
          style={{ display: 'none' }}
          onChange={this.handleVideoSelected}
        />
      )
    }

    if (!this.state.isInlineRecordingSupported) {
      return <UnsupportedView />
    }

    if (this.state.thereWasAnError) {
      return <ErrorView />
    }

    if (this.state.isCameraOn) {
      return (
        <CameraView>
          <Video
            innerRef={video => {
              this.videoTag = video
            }}
            autoPlay
            muted
          />
        </CameraView>
      )
    }

    if (this.state.isConnecting) {
      return <LoadingView />
    }

    return <DisconnectedView />
  }

  render () {
    const {
      isVideoInputSupported,
      isInlineRecordingSupported,
      thereWasAnError,
      isRecording,
      isCameraOn,
      streamIsReady,
      isConnecting
    } = this.state

    return (
      <Wrapper>
        {this.renderCameraView()}
        {this.props.renderActions({
          isVideoInputSupported,
          isInlineRecordingSupported,
          thereWasAnError,
          isRecording,
          isCameraOn,
          streamIsReady,
          isConnecting,

          onTurnOnCamera: this.turnOnCamera,
          onTurnOffCamera: this.turnOffCamera,
          onOpenVideoInput: this.handleOpenVideoInput,
          onStartRecording: this.handleStartRecording,
          onStopRecording: this.handleStopRecording
        })}
      </Wrapper>
    )
  }
}

const ActionsWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 30px;
`

VideoRecorder.defaultProps = {
  UnsupportedView: () => (
    <div>This browser is uncapable of recording video</div>
  ),
  ErrorView: () => (
    <div>
      Oh snap! Your browser failed to record your video.
      <br />
      <br />
      Please restart it and try again 👍
    </div>
  ),
  DisconnectedView: () => <div>Your camera is off</div>,
  LoadingView: () => <div>Loading...</div>,
  renderActions: ({
    isVideoInputSupported,
    isInlineRecordingSupported,
    thereWasAnError,
    isRecording,
    isCameraOn,
    streamIsReady,
    isConnecting,

    onTurnOnCamera,
    onTurnOffCamera,
    onOpenVideoInput,
    onStartRecording,
    onStopRecording
  }) => {
    const renderContent = () => {
      if (!isInlineRecordingSupported && isVideoInputSupported) {
        return <button onClick={onOpenVideoInput}>Record a video</button>
      }

      if (!isInlineRecordingSupported || thereWasAnError || isConnecting) {
        return null
      }

      if (isRecording) {
        return <button onClick={onStopRecording}>Stop recording</button>
      }

      if (isCameraOn && streamIsReady) {
        return (
          <div>
            <button onClick={onTurnOffCamera}>Turn Camera Off</button>
            <button onClick={onStartRecording}>Start recording</button>
          </div>
        )
      }

      return <button onClick={onTurnOnCamera}>Turn Camera On</button>
    }

    return <ActionsWrapper>{renderContent()}</ActionsWrapper>
  }
}
