import React, { forwardRef, useImperativeHandle } from 'react'
import type { ReactElement } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

import UnsupportedView from './defaults/unsupported-view'
import ErrorView from './defaults/error-view'
import DisconnectedView from './defaults/disconnected-view'
import LoadingView from './defaults/loading-view'
import SwitchCameraView from './defaults/switch-camera-view'
import defaultRenderActions from './defaults/render-actions'
import { useVideoRecorder } from './use-video-recorder'
import type { VideoRecorderHandle, VideoRecorderProps } from './types'

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

const defaultRenderUnsupportedView = () => <UnsupportedView />
const defaultRenderErrorView = () => <ErrorView />
const defaultRenderVideoInputView = ({
  videoInput
}: {
  videoInput: ReactElement | null
}) => <>{videoInput}</>
const defaultRenderDisconnectedView = () => <DisconnectedView />
const defaultRenderLoadingView = () => <LoadingView />
const defaultT = (x: string) => x

const VideoRecorder = forwardRef<VideoRecorderHandle, VideoRecorderProps>(
  function VideoRecorder (props, ref) {
    const {
      renderUnsupportedView = defaultRenderUnsupportedView,
      renderErrorView = defaultRenderErrorView,
      renderVideoInputView = defaultRenderVideoInputView,
      renderDisconnectedView = defaultRenderDisconnectedView,
      renderLoadingView = defaultRenderLoadingView,
      renderActions = defaultRenderActions,
      t = defaultT,
      isFlipped = true,
      countdownTime = 3000,
      timeLimit,
      showReplayControls,
      replayVideoAutoplayAndLoopOff,
      useVideoInput,
      videoControlsList,
      disablePictureInPicture,
      cameraViewClassName,
      videoClassName,
      wrapperClassName
    } = props

    const recorder = useVideoRecorder(props)
    const { state } = recorder

    useImperativeHandle(
      ref,
      () => ({
        turnOnCamera: recorder.turnOnCamera,
        turnOffCamera: recorder.turnOffCamera,
        handleSwitchCamera: recorder.switchCamera,
        handleStartRecording: recorder.startRecording,
        handleStopRecording: recorder.stopRecording,
        handlePauseRecording: recorder.pauseRecording,
        handleResumeRecording: recorder.resumeRecording,
        handleOpenVideoInput: recorder.openVideoInput,
        handleStopReplaying: recorder.stopReplaying,
        state
      }),
      [recorder, state]
    )

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
      availableDeviceIds,
      streamIsReady,
      isRunningCountdown
    } = state

    const renderCameraView = () => {
      const shouldUseVideoInput =
        useVideoInput || (!isInlineRecordingSupported && isVideoInputSupported)

      const videoInput = shouldUseVideoInput
        ? (
            <input
              ref={recorder.videoInputRef}
              key='videoInput'
              type='file'
              accept='video/*'
              capture={useVideoInput ? undefined : 'user'}
              style={{ display: 'none' }}
              onChange={recorder.handleVideoInputChange}
            />
          )
        : null

      if (isReplayingVideo) {
        return (
          <CameraView key='replay' className={cameraViewClassName}>
            <Video
              ref={recorder.replayVideoRef}
              className={videoClassName}
              src={state.videoUrl}
              loop
              muted={isReplayVideoMuted}
              playsInline
              autoPlay={!replayVideoAutoplayAndLoopOff}
              controls={showReplayControls}
              onClick={recorder.handleReplayVideoClick}
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
                <SwitchCameraView onClick={recorder.switchCamera} />
              )
            : null

        return (
          <CameraView key='camera'>
            <Video
              isFlipped={isFlipped}
              ref={recorder.cameraVideoRef}
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

    return (
      <Wrapper className={wrapperClassName}>
        {renderCameraView()}
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

          onTurnOnCamera: () => recorder.turnOnCamera(),
          onSwitchCamera: recorder.switchCamera,
          onTurnOffCamera: recorder.turnOffCamera,
          onOpenVideoInput: recorder.openVideoInput,
          onStartRecording: recorder.startRecording,
          onStopRecording: recorder.stopRecording,
          onPauseRecording: recorder.pauseRecording,
          onResumeRecording: recorder.resumeRecording,
          onStopReplaying: recorder.stopReplaying
        })}
      </Wrapper>
    )
  }
)

VideoRecorder.propTypes = {
  isOnInitially: PropTypes.bool,
  isFlipped: PropTypes.bool,
  mimeType: PropTypes.string,
  countdownTime: PropTypes.number,
  timeLimit: PropTypes.number,
  showReplayControls: PropTypes.bool,
  replayVideoAutoplayAndLoopOff: PropTypes.bool,
  constraints: PropTypes.shape({
    audio: PropTypes.any,
    video: PropTypes.any
  }),
  chunkSize: PropTypes.number,
  dataAvailableTimeout: PropTypes.number,
  useVideoInput: PropTypes.bool,
  videoControlsList: PropTypes.string,
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
} as never

export default VideoRecorder
