'use client'

import { forwardRef, useImperativeHandle } from 'react'
import type { ReactElement } from 'react'

import UnsupportedView from './defaults/unsupported-view.tsx'
import ErrorView from './defaults/error-view.tsx'
import DisconnectedView from './defaults/disconnected-view.tsx'
import LoadingView from './defaults/loading-view.tsx'
import SwitchCameraView from './defaults/switch-camera-view.tsx'
import defaultRenderActions from './defaults/render-actions.tsx'
import { useVideoRecorder } from './use-video-recorder.ts'
import { cx, useStyles } from './styles.ts'
import { translateText } from './translate.ts'
import type { VideoRecorderHandle, VideoRecorderProps } from './types.ts'

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
  function VideoRecorder(props, ref) {
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

    useStyles()
    const recorder = useVideoRecorder(props)
    const { state } = recorder

    useImperativeHandle(
      ref,
      () => ({
        turnOnCamera: recorder.turnOnCamera,
        turnOffCamera: recorder.turnOffCamera,
        handleSwitchCamera: recorder.switchCamera,
        selectDevice: recorder.selectDevice,
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
      isRunningCountdown,
      isPaused,
      facingMode
    } = state

    const renderCameraView = () => {
      const shouldUseVideoInput =
        useVideoInput || (!isInlineRecordingSupported && isVideoInputSupported)

      const videoInput = shouldUseVideoInput ? (
        <input
          ref={recorder.setVideoInput}
          key='videoInput'
          type='file'
          accept='video/*'
          capture={useVideoInput ? undefined : 'user'}
          style={{ display: 'none' }}
          onChange={recorder.handleVideoInputChange}
        />
      ) : null

      if (isReplayingVideo) {
        return (
          <div
            key='replay'
            className={cx('rvr-camera-view', cameraViewClassName)}
          >
            <video
              ref={recorder.setReplayVideo}
              className={cx(
                'rvr-video',
                'rvr-video--clickable',
                videoClassName
              )}
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
          </div>
        )
      }

      if (shouldUseVideoInput && thereWasAnError) {
        // Keep the hidden input, so picking another file can retry.
        return (
          <>
            {renderErrorView({ error })}
            {videoInput}
          </>
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
          availableDeviceIds &&
          availableDeviceIds.length >= 2 &&
          !isRecording ? (
            <SwitchCameraView
              onClick={recorder.switchCamera}
              aria-label={translateText(t, 'Switch camera')}
            />
          ) : null

        return (
          <div
            key='camera'
            className={cx('rvr-camera-view', cameraViewClassName)}
          >
            <video
              className={cx(
                'rvr-video',
                // Mirror like a mirror: a camera facing away shows the scene as is.
                isFlipped &&
                  facingMode !== 'environment' &&
                  'rvr-video--flipped',
                videoClassName
              )}
              ref={recorder.setCameraVideo}
              autoPlay
              muted
              playsInline
            />
            {switchCameraControl}
          </div>
        )
      }

      if (isConnecting) {
        return renderLoadingView()
      }

      return renderDisconnectedView()
    }

    return (
      <div className={cx('rvr-wrapper', wrapperClassName)}>
        {renderCameraView()}
        {renderActions({
          t,
          isVideoInputSupported,
          isInlineRecordingSupported,
          thereWasAnError,
          isRecording,
          isPaused,
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
          devices: state.devices,
          currentDeviceId: state.currentDeviceId,

          onTurnOnCamera: () => recorder.turnOnCamera(),
          onSwitchCamera: recorder.switchCamera,
          onSelectDevice: recorder.selectDevice,
          onTurnOffCamera: recorder.turnOffCamera,
          onOpenVideoInput: recorder.openVideoInput,
          onStartRecording: recorder.startRecording,
          onStopRecording: recorder.stopRecording,
          onPauseRecording: recorder.pauseRecording,
          onResumeRecording: recorder.resumeRecording,
          onStopReplaying: recorder.stopReplaying
        })}
      </div>
    )
  }
)

export default VideoRecorder
