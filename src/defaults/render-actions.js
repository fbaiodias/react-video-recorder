import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from './button'
import RecordButton from './record-button'
import StopButton from './stop-button'
import Timer from './timer'
import Countdown from './countdown'

const ActionsWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Actions = ({
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
  countdownTime,
  timeLimit,
  showReplayControls,
  replayVideoAutoplayAndLoopOff,
  useVideoInput,

  onTurnOnCamera,
  onTurnOffCamera,
  onOpenVideoInput,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onStopReplaying,
  onConfirm
}) => {
  const renderContent = () => {
    const shouldUseVideoInput =
      !isInlineRecordingSupported && isVideoInputSupported

    if (
      (!isInlineRecordingSupported && !isVideoInputSupported) ||
      thereWasAnError ||
      isConnecting ||
      isRunningCountdown
    ) {
      return null
    }

    if (isReplayingVideo) {
      return (
        <Button
          type='button'
          onClick={onStopReplaying}
          data-qa='start-replaying'
        >
          {t('Use another video')}
        </Button>
      )
    }

    if (isRecording) {
      return (
        <StopButton
          type='button'
          onClick={onStopRecording}
          data-qa='stop-recording'
        />
      )
    }

    if (isCameraOn && streamIsReady) {
      return (
        <RecordButton
          t={t}
          type='button'
          onClick={onStartRecording}
          data-qa='start-recording'
        />
      )
    }

    if (useVideoInput) {
      return (
        <Button type='button' onClick={onOpenVideoInput} data-qa='open-input'>
          {t('Upload a video')}
        </Button>
      )
    }

    return shouldUseVideoInput ? (
      <Button type='button' onClick={onOpenVideoInput} data-qa='open-input'>
        {t('Record a video')}
      </Button>
    ) : (
      <Button type='button' onClick={onTurnOnCamera} data-qa='turn-on-camera'>
        {t('Turn my camera ON')}
      </Button>
    )
  }

  return (
    <div>
      {isRecording && <Timer timeLimit={timeLimit} />}
      {isRunningCountdown && <Countdown countdownTime={countdownTime} />}
      <ActionsWrapper>{renderContent()}</ActionsWrapper>
    </div>
  )
}

Actions.propTypes = {
  t: PropTypes.func,
  isVideoInputSupported: PropTypes.bool,
  isInlineRecordingSupported: PropTypes.bool,
  thereWasAnError: PropTypes.bool,
  isRecording: PropTypes.bool,
  isCameraOn: PropTypes.bool,
  streamIsReady: PropTypes.bool,
  isConnecting: PropTypes.bool,
  isRunningCountdown: PropTypes.bool,
  countdownTime: PropTypes.number,
  timeLimit: PropTypes.number,
  showReplayControls: PropTypes.bool,
  replayVideoAutoplayAndLoopOff: PropTypes.bool,
  isReplayingVideo: PropTypes.bool,
  useVideoInput: PropTypes.bool,

  onTurnOnCamera: PropTypes.func,
  onTurnOffCamera: PropTypes.func,
  onOpenVideoInput: PropTypes.func,
  onStartRecording: PropTypes.func,
  onStopRecording: PropTypes.func,
  onPauseRecording: PropTypes.func,
  onResumeRecording: PropTypes.func,
  onStopReplaying: PropTypes.func,
  onConfirm: PropTypes.func
}

export default Actions
